# FROM rocker/r-ver:4.5.0
FROM rocker/r-ver:4.4.0
# FROM docker.omicsdm.cnag.dev/r-minimal:1.0.2

RUN apt-get update && apt-get install -y \
  curl \
  jq \
  python3 \
  python3.10-venv \
  python3-pip \
  libxml2 \
  pandoc \
  git \
  libfontconfig1-dev \
  libfreetype6-dev \
  libicu-dev \ 
  libglpk-dev \
  libpng-dev \ 
  libxml2-dev \
  libfribidi-dev \ 
  libharfbuzz-dev  \  
  zlib1g-dev \ 
  libbz2-dev \ 
  liblzma-dev \ 
  libzstd-dev \ 
  libdeflate-dev \
  libpcre2-dev \ 
  libreadline-dev \ 
  libcurl4-openssl-dev \
  libglpk-dev \
  libmagick++-dev \
  libssl-dev

RUN python3 -m venv /home/venv
RUN /home/venv/bin/pip install snakemake
RUN /home/venv/bin/pip install pulp==2.7.0
# reason to use pulp 2.7.0:
# AttributeError: module 'pulp' has no attribute 'list_solvers'
# https://github.com/snakemake/snakemake/issues/2607

# 3. Install Python packages
COPY requirements.txt /tmp/requirements.txt
RUN python3 -m venv /home/venv
RUN /home/venv/bin/pip install --no-cache-dir -r /tmp/requirements.txt

# 4. Install awscli
RUN curl https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip -o awscliv2.zip && \
  unzip awscliv2.zip && \
  ./aws/install && \
  rm -rf awscliv2.zip aws

RUN R -e 'install.packages("pak",repos = sprintf("https://r-lib.github.io/p/pak/stable/%s/%s/%s",.Platform$pkgType,R.Version()$os,R.Version()$arch));'
RUN R -e "pak::pkg_install('renv')"

WORKDIR /home
COPY .renvignore .
COPY renv.lock .

ENV RENV_CONFIG_PAK_ENABLED=TRUE
RUN R -e "renv::restore()"

# TODO
# Docker image building is failing because R package dependency issues

CMD [ "sh" ]