FROM rocker/r-ver:4.5.2

# Install system dependencies for both R and Python packages
RUN apt-get update && apt-get install -y \
  curl \
  jq \
  python3 \
  python3.12-venv \
  python3-pip \
  libxml2 \
  pandoc \
  git \
  libfontconfig1-dev \
  libfreetype6-dev \
  libgit2-dev \
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
  libssl-dev \
  unzip

# Set BLAS and LAPACK to libblas
RUN ARCH=$(uname -m) && \
  update-alternatives --set "libblas.so.3-${ARCH}-linux-gnu" "/usr/lib/${ARCH}-linux-gnu/blas/libblas.so.3" && \
  update-alternatives --set "liblapack.so.3-${ARCH}-linux-gnu" "/usr/lib/${ARCH}-linux-gnu/lapack/liblapack.so.3"

# Install Snakemake and Python packages
RUN python3 -m venv /home/venv
RUN /home/venv/bin/pip install snakemake
RUN /home/venv/bin/pip install pulp==2.7.0

# Install awscli
RUN curl https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip -o awscliv2.zip && \
  unzip awscliv2.zip && \
  ./aws/install && \
  rm -rf awscliv2.zip aws

# Install Python dependencies
COPY requirements.txt /tmp/requirements.txt
RUN /home/venv/bin/pip install --no-cache-dir -r /tmp/requirements.txt

# Install R package manager (pak) and renv
RUN R -e 'install.packages("pak",repos = sprintf("https://r-lib.github.io/p/pak/stable/%s/%s/%s",.Platform$pkgType,R.Version()$os,R.Version()$arch));'
RUN R -e "pak::pkg_install('renv')"

# Set up working directory
WORKDIR /home

# Copy project files
COPY .renvignore .
COPY renv.lock .

# Install R dependencies
ENV RENV_CONFIG_PAK_ENABLED=TRUE
RUN R -e "renv::restore()"

# Copy the rest of the project
COPY . .

# Create necessary directories
RUN mkdir -p in out log

CMD [ "sh" ]
