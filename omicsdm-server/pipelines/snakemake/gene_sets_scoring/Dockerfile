# FROM r-minimal:1.0.1
FROM docker.omicsdm.cnag.dev/r-minimal:1.0.2

RUN apt-get update && apt-get install -y --no-install-recommends \
  curl \
  jq \
  libcurl4-openssl-dev \             
  libfontconfig1-dev \        
  libfreetype6-dev \          
  libglpk-dev \    
  libicu-dev \                    
  libmagick++-dev \                
  libpng-dev \                        
  libssl-dev \              
  libxml2-dev                

# RUN apt-get update && \
#   apt-get install -y --no-install-recommends \
#   libbz2-dev \
#   liblzma-dev \
#   libpcre2-dev \
#   libicu-dev \
#   jq \
#   curl

#tested pkg versions
#escape 2.4.0
#clusterProfiler 4.16.0
#Matrix 1.7-3

WORKDIR /home

COPY renv.lock .
ENV RENV_CONFIG_PAK_ENABLED=TRUE
RUN R -e "renv::restore()"

# RUN Rscript -e '\
#   pak::repo_add(CRAN = "https://packagemanager.posit.co/cran/__linux__/noble/latest"); \
#   pak::pkg_install(c("Matrix","clusterProfiler","escape"))'

# 2. Install R packages via pak
# ENV R_LIBS_USER=/usr/local/lib/R/site-library
# RUN mkdir -p ${R_LIBS_USER} \
#     && Rscript -e "install.packages('pak', repos='https://cloud.r-project.org')" \
#     && Rscript -e "pak::pkg_install(c('Matrix','BiocManager','escape','clusterProfiler'))"

# 3. Install Python packages
COPY requirements.txt /tmp/requirements.txt
RUN python3 -m venv /home/venv
RUN /home/venv/bin/pip install --no-cache-dir -r /tmp/requirements.txt

# 4. Install awscli
RUN curl https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip -o awscliv2.zip && \
  unzip awscliv2.zip && \
  ./aws/install && \
  rm -rf awscliv2.zip aws

# remove build dependencies (more is not possible otherwise libmagick++-dev is removed)
RUN apt-get remove -y --purge libcurl4-openssl-dev && \
  apt-get autoremove -y && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# 5. Copy script
# WORKDIR /script
# COPY src/scRNA_GeneSetScoring.py /script/scRNA_GeneSetScoring.py
# COPY example_inputs/ example_inputs/

# 6. Set the entrypoint
# ENTRYPOINT ["python", "scRNA_GeneSetScoring.py"]
CMD [ "sh" ]


# RUN apt-get update && apt-get install curl -y

# WORKDIR /home
# COPY . .
# RUN mkdir -p in

# RUN mkdir -p ~/.local/share/renv/

# ENV RENV_CONFIG_PAK_ENABLED=TRUE
# RUN R -e "renv::restore()"

# CMD [ "sh" ]
