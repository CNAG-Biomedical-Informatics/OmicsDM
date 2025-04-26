#!make
SHELL := /bin/bash

https://stackoverflow.com/questions/50870161/can-we-include-git-commands-in-docker-image

# include .env

pg-build:
	docker build -t pg-test --no-cache .

pg-run:
	docker run -d --name pg-test pg-test

pg-ip:
	docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' pg-test

pg-rm:
	docker rm -f pg-test

pg-shell:
	docker exec -it pg-test bash

pg-psql:
	docker exec -it pg-test psql -U prod_omicsdm_3tr_rw -d migrate

pg-tables:
	docker exec -it pg-test psql -U prod_omicsdm_3tr_rw -d migrate -c "\dt"

pg-t-projects:
	docker exec -it pg-test psql -U prod_omicsdm_3tr_rw -d migrate -c "\d projects"
	docker exec -it pg-test psql -U prod_omicsdm_3tr_rw -d migrate -c "select json_agg(projects) from projects"

pg-t-project_dataset:
	docker exec -it pg-test psql -U prod_omicsdm_3tr_rw -d migrate -c "\d project_dataset"

pg-t-analyses:
	docker exec -it pg-test psql -U prod_omicsdm_3tr_rw -d migrate -c "\d analyses"

pg-t-datasets:
	docker exec -it pg-test psql -U prod_omicsdm_3tr_rw -d migrate -c "\d datasets"

pg-t-files:
	docker exec -it pg-test psql -U prod_omicsdm_3tr_rw -d migrate -c "\d files"

pg-insert:
	# docker exec -it pg-test psql -U prod_omicsdm_3tr_rw -d migrate -c "\i migrate/populate.sql"
	docker exec -it pg-test psql -U prod_omicsdm_3tr_rw -d migrate -c "\i migrate/populate.sql"

pg-rows:
	# docker exec -it pg-test psql -U prod_omicsdm_3tr_rw -d migrate -c "select json_agg(group) from group"
	docker exec -it pg-test psql -U prod_omicsdm_3tr_rw -d migrate -c "select json_agg(projects) from projects"
	docker exec -it pg-test psql -U prod_omicsdm_3tr_rw -d migrate -c "select json_agg(datasets) from datasets"
	docker exec -it pg-test psql -U prod_omicsdm_3tr_rw -d migrate -c "select json_agg(dataset_group) from dataset_group"
	docker exec -it pg-test psql -U prod_omicsdm_3tr_rw -d migrate -c "select json_agg(project_dataset) from project_dataset"
	docker exec -it pg-test psql -U prod_omicsdm_3tr_rw -d migrate -c "select json_agg(files) from files"
	docker exec -it pg-test psql -U prod_omicsdm_3tr_rw -d migrate -c "select json_agg(analyses) from analyses"
	docker exec -it pg-test psql -U prod_omicsdm_3tr_rw -d migrate -c "select json_agg(analysis_group) from analysis_group"
	docker exec -it pg-test psql -U prod_omicsdm_3tr_rw -d migrate -c "select json_agg(history) from history"

pg-migrate:
	# docker exec -it pg-test psql -U prod_omicsdm_3tr_rw -d migrate -c "\i migrate/migrate.sql"
	docker exec -it pg-test psql -U prod_omicsdm_3tr_rw -d migrate -c "\i migrate/migrate.sql"

pg-lint:
	# sqlfluff lint populate_db.sql --dialect postgres
	sqlfluff lint populate_db_new_integration_dump.sql --dialect postgres

pg-fix:
	sqlfluff fix populate_db.sql --dialect postgres

pg-test:
	bash tryMigrate.sh
