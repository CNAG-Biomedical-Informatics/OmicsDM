make pg-rm
echo "old container removed"
make pg-build
echo "new container built"
make pg-run
echo "new container started"
ip=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' pg-test)
echo "new container ip: $ip"

while ! pg_isready -h ${ip} -p 5432; do
        echo "waiting for postgres to be up"
        sleep 1
done

make pg-insert
echo "data inserted"
make pg-migrate
echo "migration done"
docker exec -it pg-test pg_dump -U prod_omicsdm_3tr_rw -d migrate > updated_db_dump.sql
# docker exec -it pg-test pg_dump -U prod_omicsdm_3tr_rw -d migrate > updated_db_dump.sql
echo "dump done"
