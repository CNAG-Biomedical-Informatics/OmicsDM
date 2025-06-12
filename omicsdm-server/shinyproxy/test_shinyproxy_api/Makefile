#!make
SHELL := /bin/bash

include .env
# include .aws.env
# include .sonar.env

.PHONY: venv
venv:
	python3 -m venv venv && source venv/bin/activate && pip3 install -r requirements.txt

kc_token:
	python3 ./get_kc_token.py

sp_status_no_kc:
	python3 ./query_shinyproxy_no_kc.py

sp_specs:
	python3 ./query_shinyproxy.py GET proxyspec

sp_active_proxies:
	python3 ./query_shinyproxy.py GET proxy

sp_admin:
	python3 ./query_shinyproxy.py GET admin/data

status_cx:
	python3 ./query_containerProxy.py GET 03_cellxgene

start_phenoranker:
	python3 ./query_shinyproxy.py POST app_i/01_phenoranker/ranker

start_hello:
	python3 ./query_shinyproxy.py POST app_i/02_hello/hello

start_cx:
	python3 ./query_shinyproxy.py POST app_i/03_cellxgene/cellxgene

stop_cx:
	python3 ./query_containerProxy.py PUT 03_cellxgene '{"desiredState": "Stopping"}'


# status_cx2:
# 	python3 ./query_shinyproxy.py GET 46a28488-c02c-4ea1-9b0e-269398fa07ee/status

# stop_cx:
# 	python3 ./query_shinyproxy.py PUT 03_cellxgene/status '{"desiredState": "Stopping"}'