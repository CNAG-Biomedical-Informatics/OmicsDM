
include .env
# include .aws.env
VER=1.0.17

AWS := /usr/local/aws-cli/v2/2.9.6/bin/aws

base:
	cd minimal && docker build -t ${DOCKER_REGISTRY}/r-minimal:${VER} . && \
	docker push ${DOCKER_REGISTRY}/r-minimal:${VER}

.PHONY: deseq2
deseq2:
	cd deseq2 && docker build --no-cache -t ${DOCKER_REGISTRY}/r-deseq2:${VER} . && \
	docker push ${DOCKER_REGISTRY}/r-deseq2:${VER}

.PHONY: fgsea
fgsea:
	cd fgsea && docker build --no-cache -t ${DOCKER_REGISTRY}/r-fgsea:${VER} . && \
	docker push ${DOCKER_REGISTRY}/r-fgsea:${VER}

.PHONY: getgo
getgo:
	cd getgo && docker build --no-cache -t ${DOCKER_REGISTRY}/r-getgo:${VER} . && \
	docker push ${DOCKER_REGISTRY}/r-getgo:${VER}

.PHONY: sc_normalisation
sc_normalisation:
	cd sc_normalisation && docker build --no-cache -t ${DOCKER_REGISTRY}/sc-normalisation:${VER} . && \
	docker push ${DOCKER_REGISTRY}/sc-normalisation:${VER}

.PHONY: gsva
gsva:
	cd gsva && docker build --no-cache -t ${DOCKER_REGISTRY}/gsva:${VER} . && \
	docker push ${DOCKER_REGISTRY}/gsva:${VER}

.PHONY: z-scoring
z-scoring:
	cd z_scoring && docker build --no-cache -t ${DOCKER_REGISTRY}/z-scoring:${VER} . && \
	docker push ${DOCKER_REGISTRY}/z-scoring:${VER}

.PHONY: sc_gene_sets_scoring
sc_gene_sets_scoring:
	cd gene_sets_scoring && docker build --no-cache -t ${DOCKER_REGISTRY}/sc-gene-sets-scoring:${VER} . && \
	docker push ${DOCKER_REGISTRY}/sc-gene-sets-scoring:${VER}

build: base deseq2 fgsea getgo sc_normalisation sc_gene_sets_scoring gsva z-scoring

s3_ls:
	$(AWS) s3 --endpoint-url=${aws_http} ls s3://${bucket} --ca-bundle ${AWS_CA_BUNDLE}
