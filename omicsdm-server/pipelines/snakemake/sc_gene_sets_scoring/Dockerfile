# FROM r-minimal:1.0.1
FROM docker.omicsdm.cnag.dev/r-minimal:1.0.0

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libbz2-dev \
    liblzma-dev \
    libpcre2-dev \
    libicu-dev \
    jq \
    curl

# 2. Install R packages via pak
# ENV R_LIBS_USER=/usr/local/lib/R/site-library
# RUN mkdir -p ${R_LIBS_USER} \
#     && Rscript -e "install.packages('pak', repos='https://cloud.r-project.org')" \
#     && Rscript -e "pak::pkg_install(c('Matrix','BiocManager','escape','clusterProfiler'))"

# 3. Install Python packages
COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

# 4. Install awscli
RUN curl https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip -o awscliv2.zip && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm -rf awscliv2.zip aws

# 5. Copy script
WORKDIR /script
COPY src/scRNA_GeneSetScoring.py /script/scRNA_GeneSetScoring.py
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
