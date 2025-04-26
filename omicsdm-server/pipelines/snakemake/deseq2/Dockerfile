FROM docker.omicsdm.cnag.dev/r-minimal:1.0.1

# Set BLAS and LAPACK to libblas otherwise on our
# virtual machine it will run into an "illegal operation" error
RUN ARCH=$(uname -m) && \
        update-alternatives --set "libblas.so.3-${ARCH}-linux-gnu" "/usr/lib/${ARCH}-linux-gnu/blas/libblas.so.3" && \
        update-alternatives --set "liblapack.so.3-${ARCH}-linux-gnu" "/usr/lib/${ARCH}-linux-gnu/lapack/liblapack.so.3"

WORKDIR /home
COPY . .

ENV RENV_CONFIG_PAK_ENABLED=TRUE
RUN R -e "renv::restore()"

CMD [ "sh" ]