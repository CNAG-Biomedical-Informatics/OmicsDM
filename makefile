#!make
SHELL := /bin/bash

include .env
# include .aws.env

CURRENT_DATE = $(shell date)
export IGNORE_CACHE_FROM_HERE:=$(CURRENT_DATE)
export KC_CMD =start-dev --import-realm
export aws_http
# For containers, the import directory is /opt/keycloak/data/import

AWS := /usr/local/aws-cli/v2/2.9.6/bin/aws

# TODO
# add command to update the submodules
# the one below does not work as expected

# update-submodules:
update:
	git submodule update --recursive

run:
	docker compose up -d

stop:	
	docker compose down

rebuild:
	docker compose build --no-cache

rebuild-api:
	docker compose build --no-cache api

d-api:
	docker compose up --build api

d-client:
	docker compose up --build client

kc:
	docker compose up keycloak

kc-export: #somehow not working
	KC_CMD="export --dir /opt/keycloak/data/import --realm convertPheno --users realm_file" docker-compose up keycloak

kc-ip:
	docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' keycloak

api-db-ip:
	docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' omicsdm-api-omicsdm-db-1

cx-db-ip:
	docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' omicsdm-cellxgene-cellxgene-db-1

s3_buckets:
	$(AWS) --endpoint-url=${aws_http} s3 ls

s3_bucket_location:
	$(AWS) --endpoint-url=${aws_http} s3api get-bucket-location --bucket ${aws_bucket}

s3_prefixes:
	$(AWS) --endpoint-url=${aws_http} s3 ls s3://${aws_bucket} | grep -w "PRE"

s3_ls:
	$(AWS) --endpoint-url=${aws_http} s3 ls s3://${aws_bucket}

s3_files:
	$(AWS) --endpoint-url=${aws_http} s3 ls s3://${aws_bucket} --recursive

cert:
	/usr/local/bin/mkcert -cert-file ./nginx_mountpoint/certs/omicsdma.cnag.dev.pem -key-file ./nginx_mountpoint/certs/omicsdma.cnag.dev-key.pem omicsdma.cnag.dev


cxg-k8-suis:
	kubectl get sui -n cellxgene

del-cxg-k8-suis:
	kubectl delete sui -n cellxgene --all

cxg-k8-pods:
	kubectl get pods -n cellxgene -l app=cellxgene

cxg-k8-logs:
	kubectl logs -n cellxgene -l app=cellxgene

update-server-config-file:
	@echo "Update the .env file with the ingress controller node port"
	cfg_file=scdm_server/server/config/config.py && \
	node_port=$$(kubectl get svc ingress-nginx-controller -n ingress-nginx -o jsonpath='{.spec.ports[0].nodePort}') && \
	echo "ING_CONTROLLER_NODE_PORT=$$node_port" && \
	sed -i -e "s/ING_CONTROLLER_NODE_PORT =.*/ING_CONTROLLER_NODE_PORT = $$node_port/" $$cfg_file

	@echo "Update the .env file with the omicsdm service account token"
	cfg_file=scdm_server/server/config/config.py && \
	token=$$(kubectl get secret omicsdm-token -o jsonpath='{.data.token}' | base64 --decode) && \
	echo "token: $$token" && \
	sed -i -e "s/ACCOUNT_TOKEN =.*/ACCOUNT_TOKEN = '$$token'/" $$cfg_file

create-docker-volume-s3fs:
	docker volume create \
		--driver local \
		--opt type=none \
		--opt device=$(S3FS_MOUNTPOINT) \
		--opt o=bind \
		s3data_external

create-docker-volume-cxg:
	docker volume create \
		--driver local \
		--opt type=none \
		--opt device=$(CXG_MOUNTPOINT)\
		--opt o=bind \
		cxgdata

s3fs-mount-test:
	s3fs $(S3_BUCKET) s3fs_mountpoint -o passwd_file=minio_secret,use_path_request_style,url=$(S3_URL),allow_other -o dbglevel=info -f

s3fs-mount:
	nohup s3fs $(S3_BUCKET) s3fs_mountpoint -o passwd_file=minio_secret,use_path_request_style,url=$(S3_URL),allow_other -o dbglevel=info -f > s3fs.log 2>&1 &

run-test-container-to-check-s3fs:
	docker run --rm -it -v s3data_external:/mnt busybox sh -lc 'echo "--- mount entry ---";mount | grep "on /mnt ";echo "--- count files ---";ls -la /mnt | wc -l'