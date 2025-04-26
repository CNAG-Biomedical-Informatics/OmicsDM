FROM docker.omicsdm.cnag.dev/r-minimal:1.0.0
# FROM r-minimal:1.0.1

WORKDIR /home
COPY . .
RUN mkdir -p in

RUN R -e "library('renv')"
RUN R -e "renv::restore()"

CMD [ "sh" ]
