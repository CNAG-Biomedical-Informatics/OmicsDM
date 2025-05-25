#!/usr/bin/env python

"""
    API endpoint that get Project Fields For React Experiment View
        Resource = /api/project
"""
import io
import json
from pathlib import Path
import tarfile
import gzip
import redis
import re

from server.utils.table_methods import db_add, db_commit

# import json

# import subprocess

# from copy import copy

# from jsonschema import validate
# from jsonschema.exceptions import ValidationError

from flask import jsonify, make_response, request
from flask_restx import Resource, Namespace

# from sqlalchemy.sql.expression import false, table
# from sqlalchemy.sql.sqltypes import DATE
# from sqlalchemy import asc, desc
# from sqlalchemy.exc import IntegrityError

from server.model import (
    Dataset,
    File,
    Group,
    Groups,
    Analysisgroups,
    Analyses,
    AnalysisTemplates,
)
from server.app import app, api, db
from server.security import login_required

# from server.utils import jenkins
from server.utils.error_handler import (
    # DatabaseError,
    # KeyNotFound,
    # WrongKey,
    # EmptyQuery,
    # WrongSchema,
    DataAlreadyPresent,
    # BadFile,
)

from server.utils import ceph

# from server.factories.create_factory import db_id_still_available
from server.factories.view_factory import data_view_builder

# from server.utils.schema import get_arr_schema, get_obj_schema
from server.utils.decorators import db_exception_handler

from sqlalchemy import or_
from sqlalchemy.orm.attributes import flag_modified
import docker
import boto3

# Note: after having added docker to the requirements.txt
# I had to downgrade urllib3
# pip install 'urllib3<2

from server.utils.celery import make_celery
from celery.signals import task_revoked

ns = Namespace("analysis", description="analysis related operations")

parser = api.parser()
parser.add_argument("Authorization", type=str, location="headers", required=True)


celery = make_celery(app)
redis_client = redis.Redis(
    host=app.config["REDIS_HOST"], port=app.config["REDIS_PORT"], db=0
)
docker_client = docker.from_env()

boto3_client_args = {
    "aws_access_key_id": app.config["ACCESS_KEY"],
    "aws_secret_access_key": app.config["SECRET_KEY"],
    "endpoint_url": app.config["CEPH_URL"],
    "verify": False,
}
print(boto3_client_args)
# boto3_client = boto3.resource("s3", **boto3_client_args)


@api.expect(parser)
@ns.route("/viewcols", methods=(["GET"]))
class AnalysisViewCols(Resource):
    """
    API endpoint that get the dataset view fields for
    the React Dataset View
    """

    @login_required
    @api.doc(description="Returns...")
    @api.response(500, "Server error")
    @api.response(200, "Success")
    def get(self, userid, groups):
        """
        Get datasets view fields
        """
        return jsonify({"headers": app.config["ANALYSIS_VIEW_HEADERS"]}, 200)


# TODO
# to be removed start

# these are implemented in the file upload factory differently
# look into there to refactor it accordingly


# @db_exception_handler
# def get_or_create_group(kc_groupname):
#     """
#     Either inserts a new keycloak group into the group table
#     or if the keycloak group is already there returns its id
#     returns: Group entity e.g. <Group 1>
#     {id: integer, kc_groupname: string}
#     """
#     group = Group.find_by_name(kc_groupname)
#     if group is None:
#         group = Group(kc_groupname=kc_groupname)
#         group.save_to_db()
#     return group


@db_exception_handler
def insert_into_db(group, group_id, analysis):
    """
    insert project into db
    """
    relationship = Analysisgroups(owner=True)
    relationship.group = group
    relationship.group_id = group_id

    analysis.groups.append(relationship)
    analysis.save_to_db()


@task_revoked.connect
def on_task_revoked(sender=None, body=None, *args, **kwargs):
    # Note the handler is not working when being in debug mode

    print(args)
    print("----kwargs-----")
    print(kwargs)
    print("----kwargs[request]-------")
    print(kwargs["request"])
    request = kwargs["request"]
    print("----request.args-----")
    print(request.args)

    args = request.args
    print("----args-----")
    print(args)
    print("----args[0]-----")
    print(args[0])
    print("----args[1]-----")
    print(args[1])

    analysis_id = args[0]
    analysis = args[1]

    print("on_task_revoked")
    print(analysis_id)
    print(analysis)

    analysis_id2 = analysis_id.strip('"')
    analysis2 = analysis.strip('"')

    # based on the analysis_id and the analysis
    # check the redis db
    redis_key = f"running_containers:{analysis_id2}_{analysis2}"
    container_id = redis_client.get(redis_key).decode()

    if container_id is None:
        print("container_id is None")
        return

    print("container_id", container_id)
    docker_container = docker_client.containers.get(container_id)
    docker_container.remove(force=True)

    # double check if the container is really gone
    # and then remove the redis key

    running_containers = docker_client.containers.list(all=False)
    container_ids = [container.id for container in running_containers]
    if container_id not in container_ids:
        redis_client.delete(redis_key)


@celery.task(bind=True)
def run_analysis(self, analysis_id, name, options, group_name):
    print("Start Celery Task")
    print(analysis_id)
    print(name)
    print(options)

    # TODO
    # validate the options if they are correct
    # e.g. if the requested reactome version is available
    # {"use_reactome_identifier_mapping_file" : "current"}

    if options.get("used_previous_analysis"):
        run_follow_up_analyses(
            {"analysis_id": analysis_id, "analysis": name}, group_name
        )
        return

    # image_version = "1.0.4"
    image_version = "1.0.0"
    if name == "deseq2":
        image_version = "1.0.3"

    # docker_registry = "docker.vm2.dev"
    docker_registry = "docker.omicsdm.cnag.dev"
    image_name = f"{docker_registry}/r-{name}:{image_version}"

    if name == "sc_gene_sets_scoring":
        image_version = "1.0.4"
        image_name = f"{docker_registry}/sc-gene-sets-scoring:{image_version}"

    # image_name = f"{name}:{image_version}"

    # TODO
    # this should not be limited to snakemake
    # but nextflow should be supported as well

    # cmd = ["/home/venv/bin/snakemake", "-c1", "--nolock", "--nocolor"]
    cmd = ["snakemake", "-c1", "--nolock", "--nocolor"]

    # convert the options to a JSON string
    json_data = json.dumps(options)

    tar_stream = io.BytesIO()
    with tarfile.open(fileobj=tar_stream, mode="w") as tar:
        tar_info = tarfile.TarInfo(name="analysis_options.json")
        tar_info.size = len(json_data)
        tar.addfile(tar_info, io.BytesIO(json_data.encode("utf-8")))

    # Rewind the tar_stream to the beginning
    tar_stream.seek(0)

    print("app.root_path", app.root_path)

    # this is only working when celery-worker is not running in a container
    # otherwise it needs the full_path on the docker-compose host
    pipeline_path = Path(app.root_path).parent / "pipelines/snakemake" / name
    print("pipeline_path", pipeline_path)

    snakefile_path = str(pipeline_path / "Snakefile")
    renviron_path = str(pipeline_path / ".Renviron")
    scripts_path = str(pipeline_path / "src")
    snakemake_logs_path = str(pipeline_path / "log")
    aws_creds_path = str(pipeline_path / "aws_config/credentials")  
    aws_cfg_path = str(pipeline_path / "aws_config/config")  

    container_snakefile_path = "/home/Snakefile"
    container_scripts_path = "/home/src"
    container_logs_path = "/home/log"
    container_renviron_path = "/home/.Renviron"
    container_aws_creds_path = "/root/.aws/credentials"
    container_aws_cfg_path = "/root/.aws/config"

    try:
        container = docker_client.containers.run(
            image_name,
            command=["sleep", "infinity"],
            volumes={
                renviron_path: {
                    "bind": container_renviron_path,
                    "mode": "ro",
                },
                snakefile_path: {
                    "bind": container_snakefile_path,
                    "mode": "ro",
                },
                # comment below out in production
                snakemake_logs_path: {
                    "bind": container_logs_path,
                    "mode": "rw",
                },
                scripts_path: {
                    "bind": container_scripts_path,
                    "mode": "ro",
                },
                aws_creds_path: {
                    "bind": container_aws_creds_path,
                    "mode": "ro",
                },
                aws_cfg_path: {
                    "bind": container_aws_cfg_path,
                    "mode": "ro",
                },
            },
            detach=True,
            extra_hosts={  # only needed when running it locally
                "minio.omicsdm.cnag.dev": "172.16.10.112"
            },
        )

        # Connect the container to the Docker Compose network
        network_name = "omicsdm-server_default"
        network = docker_client.networks.get(network_name)
        network.connect(container)

        # store the container id in Redis
        redis_client.set(f"running_containers:{analysis_id}_{name}", container.id)

        # Copy the tar archive to the container's working directory
        container.put_archive("/home", tar_stream.getvalue())

        exit_code, output = container.exec_run(cmd, workdir="/home", stream=True)

        # you can check the to redis pushed logs with:
        # redis-commander -p 8081

        print("snakemake logs")
        for line in output:
            decoded_line = line.decode("utf-8")
            print(decoded_line)
            redis_client.lpush(f"snakemake:{analysis_id}_{name}", decoded_line)

        print("snakemake logs end")

        # Note: the container.exec_run(stream=True)
        # does not return an exit code
        # if exit_code != 0:
        #     print(f"Error executing task in Docker: {output}")
        #     return {"error": str(output)}

        bytes_stream, stats = container.get_archive("/home/out")
        tar_data = b"".join(bytes_stream)

        # retrieve the following file from tar_data: _main.html
        file_content = None
        with tarfile.open(mode="r", fileobj=io.BytesIO(tar_data)) as tar:
            for member in tar.getmembers():
                if member.name == "out/_main.html":
                    file_obj = tar.extractfile(member)
                    file_content = file_obj.read()
                    # break

                # check if a file has .h5ad
                if member.name.endswith(".h5ad"):
                    file_obj = tar.extractfile(member)
                    file_content = file_obj.read()
                    
                    # save the h5ad file to S3
                    s3_key = f"{analysis_id}/{name}/{member.name}"
                    boto3_client = boto3.resource("s3", **boto3_client_args)
                    boto3_client.Object(app.config["BUCKET_NAME"], s3_key).put(Body=file_content)

        if file_content is None:
            return {"error": "File _main.html not found"}

        clientArgs = {
            "aws_access_key_id": app.config["ACCESS_KEY"],
            "aws_secret_access_key": app.config["SECRET_KEY"],
            # "endpoint_url": app.config["S3_URL_INTERNAL"], # only needed when running it with Docker Compose
            "endpoint_url": app.config["CEPH_URL"],
            "verify": False,
        }

        boto3_client = boto3.resource("s3", **clientArgs)

        #  Upload "_main.html" to S3
        s3_key = f"{analysis_id}/{name}/_main.html"
        boto3_client.Object(app.config["BUCKET_NAME"], s3_key).put(Body=file_content)

        # Upload the tar_data to S3
        with io.BytesIO() as gz_stream:
            with gzip.GzipFile(fileobj=gz_stream, mode="wb") as gz_file:
                gz_file.write(tar_data)
            gz_stream.seek(0)

            s3_key = f"{analysis_id}/{name}/results.tar.gz"
            boto3_client.Object(app.config["BUCKET_NAME"], s3_key).put(Body=gz_stream)

        container.remove(force=True)

        run_follow_up_analyses(
            {"analysis_id": analysis_id, "analysis": name}, group_name
        )

        # TODO
        # figure out if the self.update_state is needed
        self.update_state(state="SUCCESS")
        print("End Celery Task")
    except Exception as e:
        print(f"Error executing task in Docker: {e}")
        return {"error": str(e)}

    # print("End Celery Task")

    # return "SUCCESS"


def start_analysis(analysis_json, file_ids, analysis_id, group_name):
    print("start_analysis")

    all_files = analysis_json["files"]

    # generate the paths to the files
    ceph_paths = []
    files = []
    if all_files:
        for file_id in file_ids:
            file_db_obj = (
                db.session.query(File)
                .filter(File.id == file_id)
                .join(Dataset, File.dataset_id == Dataset.id)
                .join(Groups, Groups.dataset_id == Dataset.id)
                .join(Group, Group.id == Groups.group_id)
                .with_entities(
                    Group.kc_groupname,
                    Dataset.dataset_id,
                    File.name,
                    File.version,
                )
                .one_or_none()
            )
            file_owner, dataset_id, file_name, file_version = file_db_obj

            # Not sure if this is needed
            # if file_name not in all_files.values():
            # raise BadFile(file_name, f"{file_name} not found in the db")

            file_ext = file_name.rsplit(".", 1)[-1]
            ceph_file_name = f"{file_name}_uploadedVersion_{file_version}.{file_ext}"
            files.append(ceph_file_name)

            ceph_paths.append(f"{file_owner}/{dataset_id}/{ceph_file_name}")
            # ceph_file_formats += f"{file_ext}\n"

    # write the analysis json to the S3 storage
    analysis = analysis_json["analysis"]
    key = f"{analysis_id}/{analysis}/config.json"
    ceph.save_json(app.config, key, analysis_json)

    analysis_options = dict(analysis_json["options"])
    analysis_options["file_paths"] = ceph_paths
    analysis_options["analysis_id"] = analysis_id

    bases_on = analysis_json["options"]["bases_on"]
    previous_analysis_id = None
    if bases_on is not None and "_" in bases_on:
        previous_analysis_id, bases_on = bases_on.split("_")
        previous_analysis_id = f"{group_name}_{previous_analysis_id}"

    if previous_analysis_id:
        analysis_options["analysis_id"] = previous_analysis_id
        analysis_options["bases_on"] = bases_on

    try:
        task = run_analysis.delay(analysis_id, analysis, analysis_options, group_name)
    except Exception as e:
        print(e)
        return "Celery task could not be started", 404

    # TODO
    # start a celery task here

    #     jenkins_params = {
    #         "ANALYSIS_ID": analysis_id,
    #         "ANALYSIS": analysis,
    #         "ANALYSIS_OPTIONS": json.dumps(analysis_options),
    #     }

    #     build_number = jenkins.run_job(
    #         app.config, job_key, jenkins_params, started_jobs
    #     )

    # build_number = 1
    # return build_number

    return task.id


# def get_analysis_status(analysis_id):

#     analysis_id = f"{request_data.get('analysis_id')}"
#     analysis = request_data.get("analysis")

#     analysis_status = (
#         db.session.query(Analyses)
#         .join(Analysisgroups, Analysisgroups.analysis_id == Analyses.id)
#         .filter(Analyses.analysis_id == analysis_id)
#         .filter(Analysisgroups.group_id == group.id)
#         .with_entities(Analyses.status)
#         .one_or_none()
#     )

#     if analysis_status is None:
#         return make_response(jsonify({"message": "Analysis not found"}), 404)

#     if analysis_status[0] == "finished":
#         return make_response(
#             jsonify(
#                 {
#                     "analysis": analysis,
#                     "analysisStatus": analysis_status[0],
#                 }
#             ),
#             200,
#         )

#     # get jenkins job ids from the database
#     jobs = (
#         db.session.query(Analyses)
#         .filter(Analyses.analysis_id == analysis_id)
#         .with_entities(Analyses.jenkins_jobs)
#         .one_or_none()
#     )[0]

#     not_finished_jobs = []
#     finished_jobs = []
#     # TODO
#     # the is no if condition for the status "FAILED"
#     # failed_jobs = []

#     for job, job_info in jobs.items():
#         if job_info["status"] == "SUCCESS":
#             finished_jobs.append(job)
#         else:
#             not_finished_jobs.append((job, job_info["build_number"]))

#     for job, build_number in not_finished_jobs:
#         job_key = "base"
#         if job != "base_analysis":
#             job_key = "follow_up"

#         status = jenkins.get_job_status(app.config, job_key, build_number)
#         if status == "SUCCESS":
#             finished_jobs.append(job)

#         jobs[job]["status"] = status

#     # update the analysis table with the status of the analysis
#     # TODO
#     # the lock row is missing?
#     analysis_query = (
#         db.session.query(Analyses)
#         .filter(Analyses.analysis_id == analysis_id)
#         .filter(Analysisgroups.group_id == group.id)
#         .one_or_none()
#     )
#     analysis_query.jenkins_jobs = jobs

#     msg = "still running"
#     if len(finished_jobs) == len(jobs):
#         analysis_query.status = "finished"
#         msg = "analysis finished"

#     # TODO
#     # add message to the response
#     print(msg)
#     db_commit()

#     # TODO
#     # better would be to return the whole jobs object
#     # so on the frontend the status of all jobs can be displayed at once

#     return make_response(
#         jsonify(
#             {"analysis": analysis, "analysisStatus": analysis_query.status}
#         ),
#         200,
#     )


def get_analyis_db_obj(analysis_id, analysis):
    analysis_db_obj = (
        db.session.query(Analyses)
        .filter(Analyses.analysis_id == analysis_id)
        .filter(Analyses.analysis == analysis)
        .one_or_none()
    )

    if analysis_db_obj is None:
        # raise error
        return make_response(
            jsonify({"message": f"Analysis {analysis_id} not found"}), 404
        )

    return analysis_db_obj


def run_follow_up_analyses(request_data, group_name):
    analysis_id = request_data.get("analysis_id")
    finished_analysis = request_data.get("analysis")

    # TODO
    # filter the analyses by the group

    analysis_db_obj = (
        db.session.query(Analyses)
        .filter(Analyses.analysis_id == analysis_id)
        .one_or_none()
    )

    if analysis_db_obj is None:
        # TODO
        # write into the DB that the start of the follow up analyses failed
        return f"Analysis {analysis_id} not found", 404

    analysis_json = analysis_db_obj.analysis_settings
    for key, value in analysis_json.items():
        if value["analysis"] == finished_analysis:
            analysis_key = key

    # update the analysis status in the db
    current_jobs = dict(analysis_db_obj.jenkins_jobs)
    current_jobs[analysis_key]["status"] = "SUCCESS"

    if all(key in current_jobs for key in analysis_json):
        return "all follow up analyses already started", 200

    started_jobs = {}
    for analysis in analysis_json:
        # make sure that no follow up analysis is started twice
        if analysis in current_jobs:
            continue

        file_names = analysis_json[analysis]["files"].values()

        # TODO
        # the file version is also missing
        # maybe better get the file id from the client

        # query the database to get the file ids
        file_ids = []
        for file_name in file_names:
            file_id = (
                db.session.query(File)
                .filter(File.name == file_name)
                .filter(File.version == 1)
                .filter(File.upload_finished.is_(True))
                .with_entities(File.id)
                .one_or_none()
            )

            # TODO
            # thrown an error if file_id is None

            file_ids.append(file_id[0])

        build_number = start_analysis(
            analysis_json[analysis], file_ids, analysis_id, group_name
        )

        started_jobs[analysis] = {
            "build_number": build_number,
            "status": "starting",
        }

    current_jobs.update(started_jobs)
    analysis_db_obj.jenkins_jobs = current_jobs
    flag_modified(analysis_db_obj, "jenkins_jobs")
    db_commit()

    # ! TODO
    # figure out why the json is sometimes not updated

    # return "follow up analysis started", 200


def create_analysis(request_data, groups, group, userid):
    # api_success = []

    analysis_id = request_data.get("analysis_id")

    # FIXME
    # ! this function is only working if the user is only in one group
    group_name = groups[0]

    if group is None:
        group = Group(kc_groupname=group_name)
        db_add(group)

    # to make the analysis_id unique add the group name to the analysis_id
    analysis_id = f"{group_name}_{analysis_id}"

    group_id = group.id
    # make sure that the analysis is not already used in the group
    print("HERE")
    stored_analyses = (
        db.session.query(Analyses)
        .join(Analysisgroups, Analysisgroups.analysis_id == Analyses.id)
        .filter(Analysisgroups.group_id == group_id)
        .filter(getattr(Analyses, "analysis_id") == analysis_id)
        .one_or_none()
    )
    if stored_analyses is not None:
        raise DataAlreadyPresent("analysis_id")

    # TODO
    analysis_name = request_data.get("analysis_name", "")
    file_ids = request_data.get("file_ids")
    analysis_json = request_data.get("analysis_Json")

    # ! TODO
    # should not be hardcoded
    tags = "hardcoded"
    desc = "hardcoded description"

    # TODO
    # not only check the file_ids of the base_analysis
    # but also the file_ids of the follow up analyses
    # check if the user has access to the files

    if file_ids:
        # get the dataset ids based on the file ids
        conditions = [
            Groups.group_id == group_id,
            File.shared_with.contains([group_id]),
            Dataset.private.is_(False),
        ]

        dataset_ids = set()
        for file_id in request_data["file_ids"]:
            dataset = (
                db.session.query(File)
                .join(Dataset, File.dataset_id == Dataset.id)
                .join(Groups, Groups.dataset_id == Dataset.id)
                .filter(or_(*conditions))
                .filter(File.id == file_id)
                .with_entities(File.dataset_id)
                .one_or_none()
            )

            if dataset is None:
                pass
                # TODO
                # return
                # user has no access to this dataset

            dataset_ids.add(dataset[0])

    for key in analysis_json:
        if not analysis_json[key]["options"]["bases_on"]:
            analysis_name = key
            base_analysis = analysis_json[analysis_name]
            break
        else:
            print("debuggig Line 725")
            print("analysis_json")
            print(analysis_json)

    # started_jobs = {}
    build_number = start_analysis(base_analysis, file_ids, analysis_id, group_name)

    started_job = {}
    started_job[analysis_name] = {
        "build_number": build_number,
        "status": "starting",
    }

    analysis_obj = Analyses(
        analysis_id=analysis_id,
        submitter_name=userid,
        name=analysis_name,
        tags=tags,
        description=desc,
        dataset_ids=dataset_ids,
        file_ids=file_ids,
        private=True,
        shared_with=[],
        status="starting",
        analysis_settings=analysis_json,
        jenkins_jobs=started_job,
        extra_cols={},
    )

    insert_into_db(group, group_id, analysis_obj)
    return "analysis started", 200

    # TODO
    # readd request_data validation

    # analysis_ids = list(map(lambda x: x.get("id"), request_data))

    # if None in analysis_ids:
    #     return make_response(
    #         jsonify({"message": "field 'id' is missing"}), 404
    #     )

    # if len(analysis_ids) != len(set(analysis_ids)):
    #     raise WrongSchema("duplicated analysis_ids not allowed")

    # fields = app.config["ANALYSIS_FIELDS"]
    # props = {k: {"type": "string"} for k in fields}
    # schema = get_obj_schema(
    #     props, required=["id", "selected_datasets", "selected_files"]
    # )

    # for key in ["selected_files", "selected_datasets"]:
    #     schema["properties"][key] = get_arr_schema(array_of="strings")

    # for data in request_data:
    #     analysis_name = ""

    # schema = {
    #     "type": "object",
    #     "properties": {
    #         "id": {"type": "string"},
    #         "name": {"type": "string"},
    #         "description": {"type": "string"},
    #         "tags": {"type": "string"},
    #         "visibility": {"type": "string"},
    #         "selected_datasets": {
    #             "type": "array",
    #             "items": {"type": "string"},
    #             "minItems": 1,
    #         },
    #         "selected_files": {
    #             "type": "array",
    #             "items": {"type": "string"},
    #             "minItems": 1,
    #         },
    #         "Owner": {"type": "string"},
    #     },
    #     "required": ["id", "selected_datasets", "selected_files"],
    #     "additionalProperties": False,
    # }

    # TODO
    # validation is buggy right now

    # try:
    #     validate(instance=data, schema=schema)
    # except ValidationError as err:
    #     raise WrongSchema(err.message)

    # analysis_id = data["id"]
    # if group is not None:
    #     db_id_still_available(group, Analyses, "analysis_id", analysis_id)

    # TODO
    # replace this by json schema

    # get the dataset ids
    # selected_datasets = data.get("selected_datasets")
    # if not selected_datasets or selected_datasets is None:
    #     error_msg = "selected_dataset key is missing or list is empty"
    #     return make_response(
    #         jsonify({"message": error_msg}),
    #         404,
    #     )

    #   dataset_ids = []
    #    # query table to get the dataset ids

    #    # TODO
    #    # What if the shared dataset has the same name as one of projects
    #    # of the user? --> This would clash
    #    # Need another information to tell them appart
    #    # ...maybe the submitter name?

    #    for dataset in selected_datasets:
    #         ds_id = (
    #             db.session.query(Dataset)
    #             .filter(Dataset.shared_with.contains([group.id]))
    #             .filter(Dataset.dataset_id == dataset["id"])
    #             .with_entities(Dataset.id)
    #             .one_or_none()
    #         )
    #         dataset_ids.append(ds_id[0])

    # TODO
    # replace this by json schema

    # get the file ids
    # selected_files = data.get("selected_files")
    # if not selected_files or selected_files is None:
    #     error_msg = "selected_files key is missing or list is empty"
    #     return make_response(
    #         jsonify({"message": error_msg}),
    #         404,
    #     )

    # TODO
    # selected files needs to include the version

    # query table to get the file_ids
    # file_ids = []
    # for file in selected_files:
    #     print(file)
    #     files = (
    #         db.session.query(File)
    #         .filter(File.dataset_id.in_(dataset_ids))
    #         .filter(File.name == file)
    #         .all()
    #     )
    #     file_ids.extend([file.id for file in files])

    # analysis_id would require some unique information
    # since Opal does not accept duplicated project ids

    # private = True
    # visibility = (data.get("visibility"),)

    # FIXME
    # remove this it will always be true
    # if visibility is not None and visibility == "visible to all":
    #     private = False

    # try:
    #     analysis_name = data["name"]

    #     analysis = Analyses(
    #         analysis_id=analysis_id,
    #         submitter_name=userid,
    #         name=analysis_name,
    #         tags=data["tags"],
    #         description=data["description"],
    #         dataset_ids=dataset_ids,
    #         file_ids=file_ids,
    #         private=private,
    #         shared_with=[],
    #         status="starting",
    #         analysis_settings={
    #             "address": {"zip": 5678, "street": "Cross St."}
    #         },
    #     )

    # except KeyError as err:
    #     # raise
    #     print(err)
    #     return make_response(
    #         jsonify(
    #             {"message": "at least one necessary field is missing"}
    #         ),
    #         404,
    #     )

    #     jenkins_working = False
    #     if jenkins_working:

    #         # create project in Opal via Jenkins
    #         opal_project = {
    #             "PROJ": analysis_id,
    #             "NAME": analysis_name,
    #         }
    #         res = jenkins.run_job(app.config, arg, opal_project)

    #         # TODO
    #         # update analysis table with status running

    #         if res is not None:
    #             # update the analysis table with status failed
    #             return make_response(
    #                 jsonify({"message": "Analysis Project creation failed"}),
    #                 200,
    #             )

    #     res = link_to_opal_project(groups[0], analysis, True)
    #     if res is not False:
    #         api_success.append(True)
    #         print("Analysis inserted in database")
    #     else:
    #         return make_response(jsonify({"message": res}), 404)

    # if any(api_success):
    # return make_response(jsonify({"message": "Project inserted"}), 200)


def get_results(request_data, groups, group, userid, arg):
    # api_success = []

    # analysis_id = request_data.get("analysis_id")

    # FIXME
    # ! this function is only working if the user is only in one group
    group_name = groups[0]

    if group is None:
        group = Group(kc_groupname=group_name)
        db_add(group)

    # TODO
    # figure out how to check if report is already accessible
    # if not, create a new report
    # return to fronted still waiting for the analysis to be finished

    # query how to get reports metadata from Opal
    # opal rest /files/_meta/reports/project_name_new/deseq2
    # -o http://localhost:8080 -u administrator -p password --json | jq

    # TODO
    # create a subprocess to run the analysis
    # and update the status of the analysis in the database
    # if the analysis is finished
    # url = app.config["OPAL_URL"]
    # user = app.config["OPAL_USER"]
    # pw = app.config["OPAL_PASSWORD"]

    # build the path for getting the report metadata
    # "/files/_meta/reports/project_name_new/deseq2"

    # reports_json = subprocess.check_output(
    #     [
    #         "opal",
    #         "rest",
    #         "/files/_meta/reports/project_name_new/deseq2",
    #         "-o",
    #         url,
    #         "-u",
    #         user,
    #         "-p",
    #         pw,
    #     ],
    #     shell=False,
    # )

    # path = "/reports/project_name_new/rockr2"
    # report = "rockr2-20220418_1508.html"
    # pf = f"{path}/{report}"

    # # use the returned information to get the report file name
    # html = subprocess.check_output(
    #     ["opal", "file", "-o", url, "-u", user, "-p", pw, "-dl", pf],
    #     shell=False,
    # )

    html = "<h1>Hello World</h1>"
    return ("analysis done", 200, html.decode())


@ns.route("/", methods=(["POST"]))
class AnalysisStart(Resource):
    """
    API endpoint that get Analysis Fields For React Experiment View
        Resource = /api/analysis
    """

    @login_required
    def post(self, userid, groups):
        """
        Add a new analysis to the database

        """
        group_name = groups[0]
        group = Group.find_by_name(group_name)
        request_data = request.get_json()

        msg, status_code = create_analysis(request_data, groups, group, userid)
        return make_response(jsonify({"message": msg}), status_code)


# TODO
# Endpoint below is probably not needed anymore
@ns.route("/", methods=(["POST"]))
class AnalysisRun(Resource):
    """
    API endpoint for run the following analyses
        Resource = /api/analysis
    """

    @login_required
    def post(self, userid, groups):
        """
        create a new project in Opal via Jenkins
        """

        # TODO
        # add request data validation

        group_name = groups[0]
        group = db.session.query(Group).filter_by(kc_groupname=group_name).one_or_none()

        if group is None:
            return make_response(jsonify({"message": "group not found"}), 404)

        request_data = request.get_json()
        msg, status_code = run_follow_up_analyses(request_data, group.kc_groupname)
        return make_response(jsonify({"message": msg}), status_code)


@ns.route("/", methods=(["POST"]))
class AnalysisStatus(Resource):
    """
    API endpoint that get Analysis Fields For React Experiment View
        Resource = /api/analysis
    """

    @login_required
    def post(self, userid, groups):
        """
        get analysis status
        """
        group_name = groups[0]
        group = Group.find_by_name(group_name)
        request_data = request.get_json()

        # TODO
        # request_data validation
        analysis_id = f"{request_data.get('analysis_id')}"
        analysis = request_data.get("analysis")

        analyses_query = (
            db.session.query(Analyses)
            .join(Analysisgroups, Analysisgroups.analysis_id == Analyses.id)
            .filter(Analyses.analysis_id == analysis_id)
            .filter(Analysisgroups.group_id == group.id)
            .with_entities(Analyses.status, Analyses.analysis_settings)
            .one_or_none()
        )
        analysis_status, analyses_json = analyses_query

        if analysis_status is None:
            return make_response(
                jsonify({"message": f"Analysis {analysis_id} not found"}), 404
            )

        if analysis_status[0] == "finished":
            return make_response(
                jsonify(
                    {
                        "analysis": analysis,
                        "analysisStatus": analysis_status[0],
                    }
                ),
                200,
            )

        query = (
            db.session.query(Analyses)
            .filter(Analyses.analysis_id == analysis_id)
            .with_entities(Analyses.jenkins_jobs)
            .one_or_none()
        )

        jobs = dict(query[0])

        not_finished_jobs = []
        finished_jobs = []
        failed_jobs = []

        for job, job_info in jobs.items():
            if job_info["status"] == "SUCCESS":
                finished_jobs.append(job)
            else:
                not_finished_jobs.append((job, job_info["build_number"]))

        for job, build_number in not_finished_jobs:
            job_key = "base"
            if analyses_json[job]["options"]["bases_on"]:
                job_key = "follow_up"

            print("job_key", job_key)

            # get status of the job from celery
            status = celery.AsyncResult(build_number).status

            redis_key = f"snakemake:{analysis_id}_{job}"
            logs = redis_client.lrange(redis_key, 0, -1)

            # decode all items in logs list
            decoded_logs = []
            for item in logs:
                decoded_logs.append(item.decode())

            # search for the last line that contains the percentage
            # and return the percentage

            # BUG
            # Change the pattern to reflect the actual snakemake step
            # at the moment it takes some random line
            # that contains a percentage

            percentage = 0
            pattern = r"(\d+)%"
            for line in decoded_logs:
                detected = re.search(pattern, line)
                if detected:
                    percentage = detected.group(1)
                    break

            print("percentage", percentage)

            console_out = {
                "workflow_done_in_percent": percentage,
                "r_log": decoded_logs,
            }

            #     status, console_out = jenkins.get_job_status(
            #         app.config, job_key, build_number
            #     )

            # TODO
            # I do not need store any longer the console_out
            # in the database since we can get the logs
            # directly from redis

            # status = "SUCCESS"
            # console_out = {"r_log": ["test"]}

            jobs[job] = {
                "build_number": build_number,
                "status": status,
                "console_out": console_out,
            }

            if status == "SUCCESS":
                finished_jobs.append(job)
            if status in ["FAILURE", "ABORTED"]:
                failed_jobs.append(job)

        analysis_query = (
            db.session.query(Analyses)
            .filter(Analyses.analysis_id == analysis_id)
            .filter(Analysisgroups.group_id == group.id)
            .one_or_none()
        )
        analysis_query.jenkins_jobs = jobs

        msg = "still running"
        if len(finished_jobs + failed_jobs) == len(analyses_json):
            analysis_query.status = "finished"
            msg = "analysis finished"

        # TODO
        # add message to the response
        print(msg)
        flag_modified(analysis_query, "jenkins_jobs")
        db_commit()

        # TODO
        # better would be to return the whole jobs object
        # so on the frontend the status of all jobs can be displayed at once

        # TODO
        # Do not return the Jenkins Build Number to the frontend

        return make_response(
            jsonify(
                {
                    "analysis": analysis,
                    "analysisStatus": analysis_query.status,
                    "jobs": jobs,
                }
            ),
            200,
        )


@ns.route("/", methods=(["POST"]))
class AnalysisResults(Resource):
    """
    API endpoint that get Analysis Fields For React Experiment View
        Resource = /api/analysis
    """

    def create_html(
        self,
        analysis_key,
        analysis,
        analysis_id,
        jobs,
        previous_analysis_id,
        group_name,
    ):
        # analysis_key = deseq2, getgo or fgsea
        # analysis = deseq2, getgo or fgsea

        # TODO
        # on the React side figure out how to autoscroll the log to the bottom

        if analysis_key in jobs and jobs[analysis_key]["status"] != "SUCCESS":
            # get the logs from redis based on analysis_id

            redis_key = f"snakemake:{analysis_id}_{analysis}"
            logs = redis_client.lrange(redis_key, 0, -1)[::-1]

            htmlized = []
            for item in logs:
                row = item.decode().strip()
                htmlized.append(f"<br>{row}</br>")
            html_string = "".join(htmlized)
            return html_string

        s3_key = f"{analysis_id}/{analysis}/_main.html"
        if previous_analysis_id:
            s3_key = f"{group_name}_{previous_analysis_id}/{analysis}/_main.html"

        # TODO
        # sometimes the old html is not found

        res = ceph.get_file(app.config, s3_key, previous_analysis_id)
        html = "Analysis not finished"
        if res:
            html = res.decode()
        return html

    @login_required
    def post(self, userid, groups):
        """
        create a new project in Opal via Jenkins
        """
        group_name = groups[0]
        group = Group.find_by_name(group_name)
        request_data = request.get_json()

        analysis_id = request_data.get("analysis_id")

        query = (
            db.session.query(Analyses)
            .join(Analysisgroups, Analysisgroups.analysis_id == Analyses.id)
            .filter(Analyses.analysis_id == analysis_id)
            .filter(Analysisgroups.group_id == group.id)
            .with_entities(Analyses.analysis_settings, Analyses.jenkins_jobs)
            .one_or_none()
        )

        if query is None:
            return make_response(
                jsonify({"message": f"Analysis {analysis_id} not found"}), 404
            )

        # loop over the analysis json and get the htmls
        analysis_json, running_jobs = query
        htmls = {}
        for key in analysis_json:
            analysis = analysis_json[key]["analysis"]
            previous_analysis_id = analysis_json[key]["options"].get(
                "used_previous_analysis"
            )
            htmls[key] = self.create_html(
                key,
                analysis,
                analysis_id,
                running_jobs,
                previous_analysis_id,
                group_name,
            )

        msg = "analysis results"
        status_code = 200

        return make_response(jsonify({"message": msg, "htmls": htmls}), status_code)


@ns.route("/", methods=(["POST"]))
class AnalysisFiles(Resource):
    """
    API endpoint that get Analysis Fields For React Experiment View
        Resource = /api/analysis
    """

    @login_required
    def post(self, userid, groups):
        """
        create a new project in Opal via Jenkins
        """
        group_name = groups[0]
        group = Group.find_by_name(group_name)
        request_data = request.get_json()

        analysis_id_suffix = request_data.get("analysis_id")
        analysis_json = request_data.get("analysisJson")

        # TODO
        # request_data validation
        analysis_id = f"{analysis_id_suffix}"
        # analysis = request_data.get("analysis")
        # analysis = "deseq"

        analysis_status = (
            db.session.query(Analyses)
            .join(Analysisgroups, Analysisgroups.analysis_id == Analyses.id)
            .filter(Analyses.analysis_id == analysis_id)
            .filter(Analysisgroups.group_id == group.id)
            .with_entities(Analyses.status, Analyses.analysis_settings)
            .one_or_none()
        )

        if analysis_status is None:
            return make_response(
                jsonify({"message": f"Analysis {analysis_id} not found"}), 404
            )

        # make sure that the analysis is finished
        # if analysis_status[0] != "finished":
        #     return make_response(
        #         jsonify({"message": "Analysis not finished"}), 404
        #     )

        # generate presigned url
        urls = {}
        for _, value in analysis_json.items():
            analysis = value["analysis"]
            previous_analysis_id = value["options"].get("used_previous_analysis")

            if previous_analysis_id:
                analysis_id = f"{group_name}_{previous_analysis_id}"

            s3_key = f"{analysis_id}/{analysis}/results.tar.gz"
            url = ceph.create_presigned_url_for_analysis(
                app.config, "get_object", s3_key
            )
            urls[analysis] = url

        return make_response(
            jsonify({"message": "presigned url generated", "presignedUrls": urls}),
            200,
        )


@ns.route("/", methods=(["POST"]))
class AnalysisSubmissionData(Resource):
    """
    API endpoint that get Analysis Fields For React Experiment View
        Resource = /api/analysis
    """

    @login_required
    def post(self, userid, groups):
        """
        create a new project in Opal via Jenkins
        """
        group_name = groups[0]
        group = Group.find_by_name(group_name)
        request_data = request.get_json()

        analysis_id_suffix = request_data.get("analysis_id")

        # TODO
        # request_data validation
        analysis_id = f"{analysis_id_suffix}"
        # analysis = request_data.get("analysis")
        # analysis = "deseq"

        analysis = (
            db.session.query(Analyses)
            .filter(Analyses.analysis_id == analysis_id)
            .filter(Analysisgroups.group_id == group.id)
            .one_or_none()
        )

        if analysis is None:
            return make_response(
                jsonify({"message": f"Analysis {analysis_id} not found"}), 404
            )

        csv_file_name = (
            f"{analysis.submission_date}_{analysis.analysis_id}_used_files.csv"
        )

        # get the files names based on the file ids
        files = (
            db.session.query(File)
            .filter(File.id.in_(analysis.file_ids))
            .join(Groups, File.dataset_id == Groups.dataset_id)
            .join(Group, Groups.group_id == Group.id)
            .with_entities(File, Group.kc_groupname)
            .all()
        )

        file_data = {}
        for file, owner in files:
            file_data[file.id] = {
                "owner": owner,
                "dataset_id": file.dataset_id,
                "name": file.name,
                "version": file.version,
            }

        data = {
            "analysis_name": analysis.name,
            "file_data": file_data,
            "csv_file_name": csv_file_name,
            "analysis_json": analysis.analysis_settings,
        }

        return make_response(
            jsonify({"message": "access_granted", "data": data}),
            200,
        )


class AnalysisTypes(Resource):
    """
    API endpoint that get Analysis Fields For React Experiment View
        Resource = /api/analysis
    """

    @login_required
    def post(self, userid, groups):
        """
        get possible analysis types based on the files
        """

        request_data = request.get_json()
        print(request_data)

        # check if the analysis name already exists
        query = (
            db.session.query(AnalysisTemplates)
            .with_entities(AnalysisTemplates.analysis_type)
            .all()
        )

        analysis_types = list({analysis[0] for analysis in query})
        analysis_types.append("Single Cell")

        res = []
        for analysis in analysis_types:
            res.append(
                {
                    "name": analysis,
                    "description": "Templates for " + analysis + " analysis",
                }
            )

        return make_response(
            jsonify(
                {
                    "analysis_types": res,
                }
            ),
            200,
        )


class AnalysisTemplatesSubmission(Resource):
    """
    API endpoint that get Analysis Fields For React Experiment View
        Resource = /api/analysis
    """

    @login_required
    def post(self, userid, groups):
        """
        create a new project in Opal via Jenkins
        """
        # !FIMXE
        # only works when a user has only one group
        group_name = groups[0]
        if group_name != "admin":
            return make_response(jsonify({"message": "access denied"}), 403)

        request_data = request.get_json()
        analysis_json = request_data.get("analysisJson")
        analysis_type = request_data.get("analysisType")
        analysis_description = request_data.get("analysisDescription")

        analysis_name = list(analysis_json.keys())[0]

        # check if the analysis name already exists
        analysis = (
            db.session.query(AnalysisTemplates)
            .filter(AnalysisTemplates.name == analysis_name)
            .one_or_none()
        )

        if analysis is not None:
            return make_response(
                jsonify({"message": "Analysis name already exists"}), 404
            )

        # prompt the user to ask if he/she wants to overwrite the analysis

        # check if the analysis is base on another analysis
        bases_on_template_ids = []
        bases_on = analysis_json[analysis_name]["options"]["bases_on"]
        if bases_on:
            query = (
                db.session.query(AnalysisTemplates)
                .filter(AnalysisTemplates.analysis_type == analysis_type)
                .filter(AnalysisTemplates.name == bases_on)
                .with_entities(AnalysisTemplates.id)
                .one_or_none()
            )

            if query is None:
                return make_response(
                    jsonify({"message": "Based on analysis not found"}), 404
                )

            bases_on_template_ids.append(query[0])

        # add the analysis to the database
        analysis = AnalysisTemplates(
            name=analysis_name,
            analysis_type=analysis_type,
            description=analysis_description,
            based_on=bases_on_template_ids,
            template=analysis_json,
        )

        db_add(analysis)

        return make_response(jsonify({"message": "Analysis template added"}), 200)


class AnalysesPrevious(Resource):
    """
    API endpoint that
        Resource = /api/analysis/previous
    """

    # not sure if that is too complicated
    # better just ask the user if the analysis should be re executed

    # but keep this for now maybe its logic can be used later
    # to check if a previous analysis could actually be used

    # => query all the analyses of that user
    # => check the jsons of the found finished analysis to see
    # if the selected files were used already
    # if yes then ask the user if the analysis should be re executed

    @login_required
    def post(self, userid, groups):
        """
        Rerun analysis(?)
        """

        request_data = request.get_json()
        # analysis_type = request_data.get(    "analysisType")
        # # RNA Seq or Single Cell
        analysis_name = request_data.get(
            "analysisName"
        )  # name of the analysis e.g. deseq2
        selected_files = request_data.get("usedFiles")

        # get all the finished analyses of the user group
        query = (
            db.session.query(Analyses)
            .filter(Analyses.status == "finished")
            .with_entities(Analyses.analysis_id, Analyses.analysis_settings)
            .all()
        )

        if not query:
            return make_response(
                jsonify({"message": "No finished analyses found"}), 404
            )

        finished_analyses_same_files = []
        for analysis_id, settings in query:
            used_files = settings[analysis_name]["files"].values()
            used_files_set = set(used_files)
            selected_files_set = set(selected_files)

            are_all_used_files_in_selected_files = used_files_set.issubset(
                selected_files_set
            )
            if are_all_used_files_in_selected_files:
                analysis_id = analysis_id.split("_", 1)[1]
                finished_analyses_same_files.append(analysis_id)

        if len(finished_analyses_same_files) > 1:
            return make_response(
                jsonify(
                    {
                        "message": "Analysis was already executed",
                        "analysis_ids": finished_analyses_same_files,
                    }
                ),
                200,
            )

        return make_response(
            jsonify({"message": "Analysis was not executed before"}), 200
        )


class AnalysisTemplatesAll(Resource):
    """
    API endpoint that get all analysis templates
        Resource = /api/analysis/templates/list
    """

    @login_required
    def post(self, userid, groups):
        """
        get all analysis templates
        """

        # TODO
        # this endpoint should only be accessible by the admin

        query = db.session.query(AnalysisTemplates).all()

        if query is None:
            return make_response(jsonify({"message": "no templates found"}), 404)

        res = []
        for analysis in query:
            res.append(
                {
                    "name": analysis.name,
                    "description": analysis.description,
                    "analysisType": analysis.analysis_type,
                }
            )

        return make_response(jsonify({"templates": res}), 200)


class AnalysesTemplatesDelete(Resource):
    """
    API endpoint that delete an analysis template
        Resource = /api/analysis/templates/delete
    """

    @login_required
    def post(self, userid, groups):

        # TODO
        # this endpoint should only be accessible by the admin

        request_data = request.get_json()
        analysis_name = request_data.get("analysisName")

        analysis = (
            db.session.query(AnalysisTemplates)
            .filter(AnalysisTemplates.name == analysis_name)
            .one_or_none()
        )

        if analysis is None:
            return make_response(jsonify({"message": "Analysis not found"}), 404)

        db.session.delete(analysis)
        db_commit()

        return make_response(jsonify({"message": "Analysis template deleted"}), 200)


class AnalysisTemplateQuery(Resource):
    """
    API endpoint that get Analysis Templates
        Resource = /api/analysis/templates/query
    """

    # TODO
    # split AnalysisTemplateQuery
    # into one endpoint returning the templates
    # and one endpoint returning the follow Ups

    @login_required
    def post(self, userid, groups):
        """
        create a new project in Opal via Jenkins
        """
        request_data = request.get_json()

        analysis_name = request_data.get("analysisName")
        analysis_level = request_data.get("analysisLevel")
        selected_files = request_data.get("selectedFiles")
        previous_analysis_id = request_data.get("previousAnalysisId")

        # TODO
        # check if the selected files are valid

        if previous_analysis_id:
            # get the analysis settings of the previous analysis
            group = (
                db.session.query(Group)
                .filter(Group.kc_groupname == groups[0])
                .one_or_none()
            )
            if group is None:
                return make_response(jsonify({"message": "Group not found"}), 404)

            group_name = groups[0]

            analysis_id = f"{group_name}_{previous_analysis_id}"
            query = (
                db.session.query(Analyses)
                .filter(Analyses.analysis_id == analysis_id)
                .filter(Analyses.status == "finished")
                .with_entities(Analyses.analysis_settings)
                .one_or_none()
            )

            if query is None:
                return make_response(jsonify({"message": "Analysis not found"}), 404)

        query = db.session.query(AnalysisTemplates)

        if analysis_level == "analysisTypes":
            query = query.filter(
                AnalysisTemplates.analysis_type == analysis_name
            ).filter(AnalysisTemplates.based_on == [])

        elif analysis_level == "base":
            # TODO
            # add a check if the base analysis has already been executed
            # on another endpoint
            # => query all the analyses of that user
            # => check the jsons of the found finished analysis to see
            # if the selected files were used already
            # if yes then ask the user if the analysis
            # should be re executed
            # if not then ask the user based on which analysis
            # the follow ups should be run
            # if yes

            query = query.filter(AnalysisTemplates.name == analysis_name).filter(
                AnalysisTemplates.based_on == []
            )

        elif analysis_level == "followUps":
            query = query.filter(AnalysisTemplates.name == analysis_name).filter(
                AnalysisTemplates.based_on != []
            )

        query_res = query.all()

        if query_res is None:
            return make_response(jsonify({"message": "no templates found"}), 404)

        template = None
        follow_ups_query = query_res
        if analysis_level != "analysisTypes":
            # TODO
            # change bases_on to the previous analysis id

            template_id = query_res[0].id
            template = query_res[0].template

            print("analysis_name", analysis_name)
            print("previous_analysis_id", previous_analysis_id)

            if previous_analysis_id:
                if analysis_level == "base":
                    template[analysis_name]["options"][
                        "used_previous_analysis"
                    ] = f"{previous_analysis_id}"
                else:
                    based_on = template[analysis_name]["options"]["bases_on"]
                    template[analysis_name]["options"][
                        "bases_on"
                    ] = f"{previous_analysis_id}_{based_on}"

            # fgsea specific
            if "use_reactome_identifier_mapping_file" in selected_files:
                template[analysis_name]["options"][
                    "use_reactome_identifier_mapping_file"
                ] = selected_files["use_reactome_identifier_mapping_file"]
                template[analysis_name]["files"] = {}
                selected_files = {}
            # end fgsea specific

            if selected_files and set(selected_files.keys()) != set(
                template[analysis_name]["files"].keys()
            ):
                return make_response(
                    jsonify(
                        {
                            "message": "selected files != template files",
                            "template": template,
                            "selectedFiles": selected_files,
                        }
                    ),
                    501,
                )

            # expected selected files is a dictionary
            template[analysis_name]["files"].update(selected_files)

            follow_ups_query = (
                db.session.query(AnalysisTemplates)
                .filter(AnalysisTemplates.based_on.contains([template_id]))
                .all()
            )

        follow_ups = []
        if follow_ups_query:
            follow_ups_res = [analysis.name for analysis in follow_ups_query]
            for analysis in follow_ups_res:
                follow_ups.append(
                    {
                        "name": analysis,
                        "description": f"Templates for {analysis} analysis",
                    }
                )

        return make_response(
            jsonify({"template": template, "follow_ups": follow_ups}), 200
        )


@ns.route("/", methods=(["POST"]))
class AnalysisData(Resource):
    """
    API endpoint that get Analysis Fields For React Experiment View
        Resource = /api/analysis
    """

    @login_required
    def post(self, userid, groups):
        """
        create a new project in Opal via Jenkins
        """
        # !FIMXE
        # only works when a user has only one group
        group_name = groups[0]
        res = data_view_builder(group_name, Analyses, "ANALYSIS", request, ns)
        return res


@ns.route("/", methods=(["POST"]))
class AnalysisAbort(Resource):
    """
    API endpoint that get Analysis Fields For React Experiment View
        Resource = /api/analysis
    """

    @login_required
    def post(self, userid, groups):
        """
        abort an analysis
        """
        # !FIMXE
        # only works when a user has only one group
        group_name = groups[0]
        group = Group.find_by_name(group_name)

        request_data = request.get_json()
        analysis_id = request_data.get("analysis_id")
        analysis = request_data.get("analysis")

        query = (
            db.session.query(Analyses)
            .filter(Analyses.analysis_id == analysis_id)
            .filter(Analysisgroups.group_id == group.id)
            .one_or_none()
        )

        if query is None:
            return make_response(
                jsonify({"message": f"Analysis {analysis_id} not found"}), 404
            )

        current_jobs = query.jenkins_jobs
        # analyses_settings = query.analysis_settings
        if current_jobs is None:
            return make_response(jsonify({"message": "No jobs found"}), 404)

        if analysis == "ALL":
            for job in current_jobs:
                task_id = current_jobs[job]["build_number"]
                celery.control.revoke(
                    task_id,
                    terminate=True,
                    body={
                        "analysis_id": analysis_id,
                        "analysis": job,
                    },
                )
        else:
            task_id = current_jobs[analysis]["build_number"]
            celery.control.revoke(
                task_id,
                terminate=True,
                body={
                    "analysis_id": analysis_id,
                    "analysis": analysis,
                },
            )

        query.status = "ABORTED"
        db.session.commit()
        return make_response(jsonify({"message": "All Analyses aborted"}), 200)


@ns.route("/", methods=(["POST"]))
class AnalysisData2(Resource):
    """
    API endpoint that get Analysis Fields For React Experiment View
        Resource = /api/analysis
    """

    # ! The code below is no longer used

    @login_required
    def post(self, userid, groups):
        """
        create a new project in Opal via Jenkins
        """

        group_name = groups[0]
        group = Group.find_by_name(group_name)
        request_data = request.get_json()

        # if key doesn't exist, returns None
        arg = request.args.get("arg")
        if arg == "view":
            # TODO put this into the config.py
            # necessary_fields =
            # ["page", "pageSize", "sorted", "filtered", "fields"]

            # have a look into marshmallow for request validation
            # https://flask-marshmallow.readthedocs.io/en/latest/
            # or
            # restx model + @api.expect()
            # https://flask-restx.readthedocs.io/en/latest/swagger.html

            # if set(request_data.keys()) != set(necessary_fields):
            #     # raise
            #     return make_response(
            #         jsonify(
            #           {"message": "at least one necessary field is missing"}
            #           ), 404
            #     )

            # TODO
            # use "fields" to define what you want returned for the react view
            res = data_view_builder(
                group_name, group, Analyses, "ANALYSIS", request_data, ns
            )
            return res

        if arg == "create":
            msg, status_code = create_analysis(request_data, groups, group, userid, arg)
            return make_response(jsonify({"message": msg}), status_code)

        # this endpoint gets the analysis html
        if arg == "results":
            msg, status_code, results = get_results(
                request_data, groups, group, userid, arg
            )

            print(results)
            return make_response(
                jsonify({"message": msg, "html": results}), status_code
            )

        else:
            return make_response(jsonify({"message": "arg forbidden"}), 405)

    @login_required
    def put(self, userid, groups):
        """
        update a analysis of a certain userid
        """
        # print(userid)
        # print(groups)

        # # if key doesn't exist, returns None
        # arg = request.args.get("arg")

        # proj_id = request.args.get("project")

        # # get group to be added or deleted from Project.shared_with
        # group = request.args.get("group")

        # grp = Group.find_by_na/api/analysis?arg=viewme(group)
        # if grp is None:
        #     return make_response(
        #         jsonify({"message": "group not exist"}), 404
        # )

        # group_id = grp.id

        # user_group = Group.find_by_name(groups[0])
        # user_group_id = user_group.id

        # # do not allow adding/removal if the user's group is owner:
        # if group_id == user_group_id:
        #     return make_response(jsonify({"message": "group is owner"}), 405)

        # project = (
        #     db.session.query(Project)
        #     .with_for_update()  # locks the row
        #     .join(Groups, Project.id == Groups.project_id)
        #     .filter(Groups.group_id == user_group_id)
        #     .filter(Project.project_id == proj_id)
        #     .first()
        # )

        # if project is None:
        #     return make_response(
        #       jsonify({"message": "project not exist"}), 404
        # )

        # files = (db.session.query(File)
        #   .filter(File.project_id == project.id)
        #   .all()
        # )

        # # update does not work w/o using copy
        # updated_groups = copy(project.shared_with)

        # if arg == "addGroup":
        #     if group_id in updated_groups:
        #         return make_response(
        #             jsonify({"message": "group is already added"}), 405
        #         )

        #     updated_groups.append(group_id)

        # elif arg == "removeGroup":
        #     updated_groups.remove(group_id)

        # else:
        #     return make_response(jsonify({"message": "arg forbidden"}), 405)

        # project.shared_with = updated_groups

        # # updating the shared_with on the project level
        # # overwrites the shared with on file level
        # for file in files:
        #     file.shared_with = updated_groups

        # try:
        #     db.session.commit()  # save and release the lock
        # except IntegrityError as e:
        #     print(e)
        #     return str(e.orig)
        # except Exception as e:
        #     print(e)
        #     db.session.rollback()
        #     return str(e)

        # return make_response(jsonify({"message": "Groups updated"}), 200)


ns.add_resource(AnalysisViewCols, "/viewcols", endpoint="analysis_view_cols")
ns.add_resource(AnalysisStart, "/start", endpoint="start_analysis")
ns.add_resource(AnalysesPrevious, "/previous", endpoint="get_previous_analyses"),
ns.add_resource(AnalysisRun, "/run", endpoint="run_analysis"),
ns.add_resource(AnalysisAbort, "/abort", endpoint="abort_analysis")
ns.add_resource(AnalysisStatus, "/status", endpoint="analysis_status")
ns.add_resource(AnalysisResults, "/results", endpoint="analysis_results")
ns.add_resource(AnalysisFiles, "/files", endpoint="analysis_files")
ns.add_resource(AnalysisData, "/data", endpoint="analysis_data")
ns.add_resource(
    AnalysisSubmissionData,
    "/submissiondata",
    endpoint="analysis_submission_data",
)
ns.add_resource(
    AnalysisTemplatesSubmission,
    "/template/save",
    endpoint="analysis_template_submission",
)

ns.add_resource(
    AnalysisTemplatesAll,
    "/templates/list",
    endpoint="analysis_templates",
)

ns.add_resource(
    AnalysesTemplatesDelete,
    "/templates/delete",
    endpoint="analysis_templates_delete",
)

ns.add_resource(
    AnalysisTemplateQuery,
    "/template/query",
    endpoint="analysis_template_query",
)
ns.add_resource(
    AnalysisTypes,
    "/types",
    endpoint="analysis_types",
)
