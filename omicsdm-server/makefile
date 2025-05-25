#!make
SHELL := /bin/bash
export AWS_PROFILE=omicsdm
export AWS_CA_BUNDLE=/usr/local/share/ca-certificates/mkcert-rootCA-vm-analysis1.crt

include .env
include .aws.env
export aws_http
# export aws_http2
# export aws_https
# export aws_bucket
# include .sonar.env

install:
	pip install --upgrade .

.PHONY: venv
venv:
	python3 -m venv venv && source venv/bin/activate && pip install -r requirements-mini.txt

kc:
	bash getKCTokens.sh

kc-key:
	bash ./get_public_kc_key.sh http://${KC_URL} Shinyproxy

token:
	echo -e token=$(shell httpyac oauth2 --flow password ) > tests/manual/.env

db-run:
	docker run --name 3tr-pg -e POSTGRES_PASSWORD=password -d postgres

db-ip:
	docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' omicsdm-server-db-1

db-empty:
	python3 emptyAllTables.py postgres:password postgres $(shell docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' omicsdm-server-db-1)

pgschema:
	docker exec "3tr-pg" pg_dump --schema-only -U postgres > db_schema.sql

run:
	FLASK_APP=server.app.py FLASK_DEBUG=1 FLASK_RUN_PORT=8082 flask run

poetry:
	FLASK_APP=server.run.py FLASK_DEBUG=1 FLASK_RUN_PORT=8082 poetry run flask run

stop:
	fuser -k 8082/tcp

auth-test:
	python3 -m pytest --junitxml=tests/reports/junit.xml tests/test_auth.py

test:
	python3 -m pytest --junitxml=tests/reports/junit.xml tests/

remove_reports:
	rm -rf tests/reports/coverage

cov:
	python3 -m pytest --junitxml=tests/reports/junit.xml --cov-config=tests/.coveragerc --cov-branch --cov-report html:tests/reports/coverage --cov-report xml:tests/reports/coverage/coverage.xml --cov-report term --cov=server tests/

format:
	black .
	git commit -am "black formated"
	git push

jenkins-format:
	npm-groovy-lint --format --verbose jenkinsfile

flake:
	echo > tests/reports/flake8/flake8stats.txt
	flake8 server --statistics --tee --output-file tests/reports/flake8/flake8stats.txt --format=html --htmldir=tests/reports/flake8 --exit-zero

lint:
	echo > tests/reports/flake8/flake8stats.txt
	flake8 server --statistics --tee --output-file tests/reports/flake8/flake8stats.txt --format=html --htmldir=tests/reports/flake8 --exit-zero
	pylint server --exit-zero

jenkins-lint:
	npm-groovy-lint --fix --verbose jenkinsfile

badge:
	genbadge tests -v -i tests/reports/junit.xml -o tests/reports/tests-badge.svg
	genbadge coverage -v -i tests/reports/coverage/coverage.xml -o tests/reports/coverage-badge.svg
	genbadge flake8 -v -i tests/reports/flake8/flake8stats.txt -o tests/reports/flake8-badge.svg

push:	test cov lint badge
	git add -A
	git commit -am "updated tests,cov,lint badge"
	git push

sonar:
	bash sonar.sh

kill-sonar:
	bash kill-sonar.sh

#active python env needs to be deactivated
semgrep:
	semgrep --config auto

api_auth:
	httpyac tests/manual/download.http


s3_buckets:
	aws --endpoint-url=${aws_http} --ca-bundle=${AWS_CA_BUNDLE} s3 ls 

s3_prefixes:
	aws --endpoint-url=${aws_http} s3 ls s3://${aws_bucket} | grep -w "PRE"

s3_files_cellxgene:
	aws --endpoint-url=${aws_http} s3 ls s3://${aws_bucket}/3TR-cellxgene/

s3_files:
	aws --endpoint-url=${aws_http} s3 ls s3://${aws_bucket}/3tr/test/

s3_files_2:
	aws --endpoint-url=${aws_http} s3 ls s3://${aws_bucket}/3tr/test2

s3_files_all:
	aws --endpoint-url=${aws_http} s3 ls s3://${aws_bucket}

s3_presign:
	aws --debug --endpoint-url=${aws_http} s3 presign s3://${aws_bucket}/test/testfile1.csv

s3_presigned_upload:
	python3 ./tests/manual/s3/upload.py

s3_https_error:
	aws --debug --endpoint-url=${aws_https} --no-verify-ssl s3 ls s3://${aws_bucket}

s3_presign_https:
	aws --debug --endpoint-url=${aws_https} --no-verify-ssl s3 presign s3://${aws_bucket}/test/testfile1.csv

celery:
	. venv/bin/activate && \
	celery -A server.app.celery worker --loglevel=info

cf:
	. venv/bin/activate && \
	FLASK_APP=server.app.py FLASK_DEBUG=1 FLASK_RUN_PORT=8082 FLASK_RUN_HOST=0.0.0.0 flask run & \
	celery --config server.config.celeryconfig -A server.app.celery worker --loglevel=info --events

rdc:
	redis-commander --redis-host localhost --redis-port 6379

restart-shinyproxy:
	docker compose -f docker-compose.yml down shinyproxy
	docker compose -f docker-compose.yml up -d shinyproxy

docker-plugin-s3fs-install:
	docker plugin install rexray/s3fs \
  	S3FS_OPTIONS="allow_other,use_path_request_style,nonempty,url=http://localhost:9000" \
 	S3FS_ENDPOINT="http://localhost:9000" \
  	S3FS_ACCESSKEY=admin \
  	S3FS_SECRETKEY=12345678

#s3fs-mount:
#	s3fs bucketdevel3tropal s3fs_mountpoint -o passwd_file=minio_secret,use_path_request_style,url=http://localhost:9000,allow_other -o dbglevel=info -f

s3fs-mount:
	nohup s3fs bucketdevelomicsdm s3fs_mountpoint -o passwd_file=minio_secret,use_path_request_style,url=https://minio.omicsdm.cnag.dev,allow_other -o dbglevel=info -f > s3fs.log 2>&1 &

check-mount:
	mount | grep s3fs

create-docker-volume-s3fs:
	docker volume create \
		--driver local \
		--opt type=none \
		--opt device=/home/ivo/projects/bioinfo/cnag/repos/omicsdm/omicsdm-server/s3fs_mountpoint \
		--opt o=bind \
		s3data_external

create-docker-volume-cxg:
	docker volume create \
		--driver local \
		--opt type=none \
		--opt device=/home/ivo/projects/bioinfo/cnag/repos/omicsdm/omicsdm-server/cxg_mountpoint \
		--opt o=bind \
		cxgdata

shinyproxy-ip:
	docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' shinyproxy

docker-cxg:
	docker run --rm -it -v $(shell pwd)/s3fs_mountpoint:/data cz/cellxgene:latest \
		cellxgene launch /data/3tr_sgfeg4g4444/sc_gene_sets_scoring/out/results/data_scored.h5ad