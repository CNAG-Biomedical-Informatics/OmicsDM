# FROM r-minimal:1.0.1
FROM docker.omicsdm.cnag.dev/r-minimal:1.0.0

RUN apt-get update && apt-get install curl -y

WORKDIR /home
COPY . .
RUN mkdir -p in

RUN mkdir -p ~/.local/share/renv/

ENV RENV_CONFIG_PAK_ENABLED=TRUE
RUN R -e "renv::restore()"

CMD [ "sh" ]
