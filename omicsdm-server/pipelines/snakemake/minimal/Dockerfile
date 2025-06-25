# FROM rocker/r-ver:4.4.2
FROM rocker/r-ver:4.5.0

RUN apt-get update && apt-get install -y \
	python3 \
	python3.12-venv \
	python3-pip \
	libxml2 \
	pandoc

RUN python3 -m venv /home/venv
RUN /home/venv/bin/pip install snakemake
# RUN pip3 install pulp==2.7.0
# reason to use pulp 2.7.0:
# AttributeError: module 'pulp' has no attribute 'list_solvers'
# https://github.com/snakemake/snakemake/issues/2607

RUN R -e 'install.packages("pak",repos = sprintf("https://r-lib.github.io/p/pak/stable/%s/%s/%s",.Platform$pkgType,R.Version()$os,R.Version()$arch));'
RUN R -e "pak::pkg_install('renv')"

WORKDIR /home
COPY . .

ENV RENV_CONFIG_PAK_ENABLED=TRUE
RUN R -e "renv::restore()"