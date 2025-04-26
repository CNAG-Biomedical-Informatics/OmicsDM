run-deseq2-docker:
	docker run --rm \
	-v $(PWD)/Snakefile:/home/Snakefile:ro \
	-v $(PWD)/src:/home/src:ro \
	-v $(PWD)/.Renviron:/home/.Renviron:ro \
	-v $(PWD)/analysis_options.json:/home/analysis_options.json:ro \
	-v $(PWD)/docker-out:/home/out \
	--add-host minio.omicsdm.cnag.dev:172.16.10.112 \
	-it docker.omicsdm.cnag.dev/r-deseq2:1.0.2 /home/venv/bin/snakemake -F

run-docker-R:
	docker run --rm \
	-it docker.omicsdm.cnag.dev/r-deseq2:1.0.1 bash