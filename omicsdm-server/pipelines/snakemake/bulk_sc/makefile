.PHONY: build run test clean help

IMAGE_NAME = omicsdm-all-pipeline
IMAGE_TAG = latest

help:
	@echo "Available targets:"
	@echo "  build        - Build the Docker image"
	@echo "  run          - Run the pipeline in Docker"
	@echo "  test         - Run pipeline tests"
	@echo "  clean        - Clean output directories"
	@echo "  shell        - Open shell in Docker container"

build:
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) .

run:
	docker run --rm \
	-v $(PWD)/Snakefile:/home/Snakefile:ro \
	-v $(PWD)/src:/home/src:ro \
	-v $(PWD)/config:/home/config:ro \
	-v $(PWD)/docker-out:/home/out \
	--add-host minio.omicsdm.cnag.dev:172.16.10.112 \
	-it $(IMAGE_NAME):$(IMAGE_TAG) /home/venv/bin/snakemake -F

shell:
	docker run --rm \
	-v $(PWD)/Snakefile:/home/Snakefile:ro \
	-v $(PWD)/src:/home/src:ro \
	-v $(PWD)/config:/home/config:ro \
	-v $(PWD)/docker-out:/home/out \
	--add-host minio.omicsdm.cnag.dev:172.16.10.112 \
	-it $(IMAGE_NAME):$(IMAGE_TAG) bash

clean:
	rm -rf docker-out out log .snakemake

test:
	@echo "Running pipeline tests..."
	/home/venv/bin/snakemake --dry-run
