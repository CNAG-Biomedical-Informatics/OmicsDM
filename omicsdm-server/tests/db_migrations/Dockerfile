FROM postgres

ENV POSTGRES_DB migrate
ENV POSTGRES_USER prod_omicsdm_3tr_rw
# ENV POSTGRES_USER devel_omicsdm_3tr_rw
ENV POSTGRES_HOST_AUTH_METHOD=trust

COPY migrate_prod.sql migrate/migrate.sql
COPY populate_prod_db.sql migrate/populate.sql

COPY prod_omics_3tr_schema.sql /docker-entrypoint-initdb.d/
