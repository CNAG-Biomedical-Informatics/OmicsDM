import json
import uuid

import time
from datetime import datetime

from random import randint

from server.model import Dataset

from utils import (
    req_post,
    req_put,
    req_get,
    add_dataset,
    add_project,
    filter_view,
    filter_by,
    modify_db,
    del_from_db,
    modify_ds_data,
    upload_data_policy_file,
    upload_clinical_data_file,
)


# look in the concepts of partials maybe this could reduce
# the number of needed function arguments:
# https://link.medium.com/W7FF7YcLRrb

# TODO
# add test for empty form submission
# at the moment this runs through in the frontend -> error should be thrown

# dataset_create_url_suffix = "datasets?arg=create"
dataset_create_url_suffix = "datasets/create"
dataset_view_url_suffix = "datasets/all"
dataset_add_group_url_suffix = "datasets?arg=addGroup"
dataset_remove_group_url_suffix = "datasets?arg=removeGroup"
dataset_submission_cols_url_suffix = "datasets/submissioncols"

dataset_admin_view_suffix = "datasets/admin/view"
dataset_admin_mode_suffix = "datasets/admin/update"

projects_create_url_suffix = "projects/create"

msg_groups_updated = "groups updated"

# TODO
# test missing when doing the data policy upload
# make sure that only one file is allowed to be uploaded

# TODO
# replace json.loads with res.json["message"]

# !FIXME
# Tests are no longer working because
# of the addition of the pagination

# TODO
# the extra cols for all the datasets are not always the same
# sometimes the fields for file and file2 are missing
# or the fields for policy_presigned_url and clinical_presigned_url
# => on the dataset creation function
# first initialize the extra cols with the correct fields
# and then add the values
# this should fix the problem


class TestDatasetSubmissionValidation:
    def test_dataset_get_submission_cols(
        self, client, header_admin, header, project_fields
    ):

        project_id = str(uuid.uuid4())

        add_project(
            client,
            header_admin,
            project_id,
            project_fields,
            projects_create_url_suffix,
        )

        query = {"project_id": project_id, "col_id": "disease"}

        res = req_post(
            client, header, dataset_submission_cols_url_suffix, query
        )
        assert "message" in res.json

        cols = res.json["headers"]
        assert len(cols) == 21

        assert [
            "description",
            "id",
            "inputType",
            "mandatory",
            "selection",
            "title",
        ] == list(cols[0].keys())

        assert cols[0]["id"] == "id"
        assert type(cols[0]["mandatory"]) == bool
        assert type(cols[0]["selection"]) == list

    def test_dataset_submission_validation_success(
        self, client, header_admin, header, dataset_fields, project_fields
    ):

        # Validate the submission of multiple datasets
        # Make sure that in all the to be to the db added datasets
        # the dataset_id not already exists

        add_dataset(
            client,
            header_admin,
            header,
            project_fields,
            dataset_fields,
            add_to_db=False,
        )

    def test_dataset_submission_validation_id_already_exists(
        self, client, header_admin, header, dataset_fields, project_fields
    ):

        # scenario:
        # make sure that it is impossible
        # to create a dataset with a duplicate id
        # (= because the dataset_id already exists for that group)
        # => meaning the combination of group_id and dataset_id must be unique

        dataset_id = str(uuid.uuid4())

        for error, add_to_db_bool in [
            (None, True),
            (f"{dataset_id} already exists", False),
        ]:
            add_dataset(
                client,
                header_admin,
                header,
                project_fields,
                dataset_fields,
                dataset_id=dataset_id,
                expected_error=error,
                add_to_db=add_to_db_bool,
            )


class TestDatasetSubmission:
    def test_get_dataset_submission_cols_options_for_diseases(
        self,
        client,
        header_admin,
        header,
        project_fields,
    ):

        project_id = str(uuid.uuid4())

        add_project(
            client,
            header_admin,
            project_id,
            project_fields,
            projects_create_url_suffix,
        )

        query = {"project_id": project_id, "col_id": "disease"}

        expected_opts = [
            "select",
            "healthy control",
            "COPD",
            "ASTHMA",
            "CD",
            "UC",
            "MS",
            "SLE",
            "RA",
        ]

        res = req_post(
            client, header, dataset_submission_cols_url_suffix, query
        )

        response = json.loads(res.data.decode("utf8"))
        assert "colum options returned" in response["message"]
        assert expected_opts == response["options"]

    def test_get_dataset_submission_cols_options_for_visibility(
        self, client, header_admin, header, project_fields
    ):

        project_id = str(uuid.uuid4())

        add_project(
            client,
            header_admin,
            project_id,
            project_fields,
            projects_create_url_suffix,
        )

        query = {"project_id": project_id, "col_id": "visibility"}

        expected_opts = ["private", "visible to all"]

        res = req_post(
            client, header, dataset_submission_cols_url_suffix, query
        )

        response = json.loads(res.data.decode("utf8"))
        assert "colum options returned" in response["message"]
        assert expected_opts == response["options"]

    def test_get_dataset_submission_cols_options_no_access_to_that_project(
        self, client, header_4
    ):

        query = {"project_id": "test", "col_id": "visibility"}

        res = req_post(
            client, header_4, dataset_submission_cols_url_suffix, query
        )

        response = json.loads(res.data.decode("utf8"))
        assert "no access to that project" in response["message"]

    def test_get_dataset_submission_cols_options_for_visibility_changeable_T(
        self, client, header_admin, header_4, project_fields
    ):

        # scenario:
        # get the visibility options for a dataset submission
        # when on the the project level the visibility changeable

        # create a project
        proj_id = str(uuid.uuid4())

        data = add_project(
            client,
            header_admin,
            proj_id,
            project_fields,
            projects_create_url_suffix,
            submit=False,
        )

        data["owners"] = "granada"
        data["datasetVisibilityChangeable"] = True
        data["datasetVisibilityDefault"] = "visible to all"

        res = req_post(
            client, header_admin, projects_create_url_suffix, [data]
        )

        response = json.loads(res.data.decode("utf8"))

        assert 200 == res.status_code
        assert "project inserted" in response["message"]

        query = {"project_id": proj_id, "col_id": "visibility"}

        expected_opts = ["visible to all", "private"]

        res = req_post(
            client, header_4, dataset_submission_cols_url_suffix, query
        )

        response = json.loads(res.data.decode("utf8"))
        assert "colum options returned" in response["message"]
        assert expected_opts == response["options"]

    def test_get_dataset_submission_cols_options_for_visibility_changeable_F(
        self, client, header_admin, header_4, project_fields
    ):

        # scenario:
        # get the visibility options for a dataset submission
        # when on the the project level the visibility changeable

        # create a project
        proj_id = str(uuid.uuid4())

        data = add_project(
            client,
            header_admin,
            proj_id,
            project_fields,
            projects_create_url_suffix,
            submit=False,
        )

        data["owners"] = "granada"
        data["datasetVisibilityChangeable"] = False
        data["datasetVisibilityDefault"] = "visible to all"

        res = req_post(
            client, header_admin, projects_create_url_suffix, [data]
        )

        response = json.loads(res.data.decode("utf8"))

        assert 200 == res.status_code
        assert "project inserted" in response["message"]

        query = {"project_id": proj_id, "col_id": "visibility"}

        expected_opts = ["visible to all"]

        res = req_post(
            client, header_4, dataset_submission_cols_url_suffix, query
        )

        response = json.loads(res.data.decode("utf8"))
        assert "colum options returned" in response["message"]
        assert expected_opts == response["options"]

    def test_datasets_create(
        self,
        client,
        header_admin,
        header,
        header_2,
        dataset_fields,
        project_fields,
    ):

        for header in [header, header_2]:

            row = add_dataset(
                client,
                header_admin,
                header,
                project_fields,
                dataset_fields,
                submit=False,
            )

            res = req_post(
                client,
                header,
                dataset_create_url_suffix,
                row,
            )

            assert 200 == res.status_code

            response = json.loads(res.data.decode("utf8"))
            assert "dataset inserted" in response["message"]

    def tests_datasets_create_w_data_policy_file(
        self, client, header_admin, header, dataset_fields, project_fields
    ):

        upload_data_policy_file(
            client, header_admin, header, project_fields, dataset_fields
        )

    def tests_datasets_create_w_data_policy_file_wrong_file_ext(
        self, client, header_admin, header, dataset_fields, project_fields
    ):

        dataset_id = str(uuid.uuid4())
        project_id = str(uuid.uuid4())

        add_dataset(
            client,
            header_admin,
            header,
            project_fields,
            dataset_fields,
            dataset_id=dataset_id,
            project_id=project_id,
            overwrite_fields={"file": ["test.tsv"]},
            expected_error=(
                "The data usage policy file must be in .pdf format"
            ),
        )

    def tests_datasets_create_w_multiple_data_policy_files(
        self, client, header_admin, header, dataset_fields, project_fields
    ):

        dataset_id = str(uuid.uuid4())
        project_id = str(uuid.uuid4())

        add_dataset(
            client,
            header_admin,
            header,
            project_fields,
            dataset_fields,
            dataset_id=dataset_id,
            project_id=project_id,
            overwrite_fields={"file": ["test.txt", "test2.txt"]},
            expected_error=("['test.txt', 'test2.txt'] is too long"),
        )

    def test_datasets_create_w_data_policy_file_finish_upload_group_not_exist(
        self, client, header_5
    ):
        # group is only none if the user's keycloak group
        # has never interacted with the server before
        # => blocks possible malicious actions

        res2 = req_post(
            client,
            header_5,
            "datasets/policy/uploadfinish",
            {"aws_key": "cnag/test/dataPolicy/dataPolicy.txt"},
        )

        response2 = json.loads(res2.data.decode("utf8"))
        assert "user not authorized" in response2["message"]

    def test_datasets_create_w_data_policy_file_finish_upload_wrong_group_name(
        self, client, header, view_query
    ):

        # dummy query to add the user's group to the db
        req_post(client, header, dataset_view_url_suffix, view_query)

        # /finishUpload is called
        res2 = req_post(
            client,
            header,
            "datasets/policy/uploadfinish",
            {"aws_key": "cnag/test/dataPolicy/dataPolicy.txt"},
        )

        response2 = json.loads(res2.data.decode("utf8"))
        assert "group name does not match" in response2["message"]

    def test_datasets_create_w_data_policy_file_finish_upload_ds_not_exist(
        self, client, header, view_query
    ):

        # dummy query to add the user's group to the db
        req_post(client, header, dataset_view_url_suffix, view_query)

        # /finishUpload is called
        res2 = req_post(
            client,
            header,
            "datasets/policy/uploadfinish",
            {"aws_key": "3tr/test/dataPolicy/dataPolicy.txt"},
        )

        response2 = json.loads(res2.data.decode("utf8"))
        assert "dataset does not exist" in response2["message"]

    def test_create_dataset_w_clinical_data(
        self, client, header_admin, header, dataset_fields, project_fields
    ):

        # TODO
        # the clinical data tests are the same as the data policy tests
        # so it would be good to refactor them into a single function (class?)

        upload_clinical_data_file(
            client, header_admin, header, project_fields, dataset_fields
        )

    def tests_datasets_create_w_clinical_data_file_wrong_file_ext(
        self, client, header_admin, header, dataset_fields, project_fields
    ):

        dataset_id = str(uuid.uuid4())
        project_id = str(uuid.uuid4())

        add_dataset(
            client,
            header_admin,
            header,
            project_fields,
            dataset_fields,
            dataset_id=dataset_id,
            project_id=project_id,
            overwrite_fields={"file2": ["test.pdf"]},
            expected_error=("The clinical data file must be in .csv format"),
        )

    def tests_datasets_w_multiple_clinical_data_files(
        self, client, header_admin, header, dataset_fields, project_fields
    ):

        dataset_id = str(uuid.uuid4())
        project_id = str(uuid.uuid4())

        add_dataset(
            client,
            header_admin,
            header,
            project_fields,
            dataset_fields,
            dataset_id=dataset_id,
            project_id=project_id,
            overwrite_fields={"file2": ["test.txt", "test2.txt"]},
            expected_error=("['test.txt', 'test2.txt'] is too long"),
        )

    def test_datasets_create_w_clinical_data_finish_upload_group_not_exist(
        self, client, header_5
    ):
        # group is only none if the user's keycloak group
        # has never interacted with the server before
        # => blocks possible malicious actions

        res2 = req_post(
            client,
            header_5,
            "datasets/clinical/uploadfinish",
            {"aws_key": "cnag/test/clinicalData/clinical.csv"},
        )

        response2 = json.loads(res2.data.decode("utf8"))
        assert "user not authorized" in response2["message"]

    def test_datasets_create_w_clinical_data_finish_upload_wrong_group_name(
        self, client, header, view_query
    ):

        # dummy query to add the user's group to the db
        req_post(client, header, dataset_view_url_suffix, view_query)

        # /finishUpload is called
        res2 = req_post(
            client,
            header,
            "datasets/clinical/uploadfinish",
            {"aws_key": "cnag/test/dataPolicy/clinical.csv"},
        )

        response2 = json.loads(res2.data.decode("utf8"))
        assert "group name does not match" in response2["message"]

    def test_datasets_create_w_clinical_data_file_finish_upload_ds_not_exist(
        self, client, header, view_query
    ):

        # dummy query to add the user's group to the db
        req_post(client, header, dataset_view_url_suffix, view_query)

        # /finishUpload is called
        res2 = req_post(
            client,
            header,
            "datasets/clinical/uploadfinish",
            {"aws_key": "3tr/test/clinicalData/clinical.csv"},
        )

        response2 = json.loads(res2.data.decode("utf8"))
        assert "dataset does not exist" in response2["message"]

    def test_datasets_create_wrong_fields(
        self, client, header_admin, header, project_fields, dataset_fields
    ):

        add_dataset(
            client,
            header_admin,
            header,
            project_fields,
            dataset_fields,
            overwrite_fields={"field1": "wrong"},
            expected_error="Additional properties are not allowed",
        )

    def test_datasets_create_field_has_wrong_enums(
        self, client, header_admin, header, project_fields, dataset_fields
    ):

        add_dataset(
            client,
            header_admin,
            header,
            project_fields,
            dataset_fields,
            overwrite_fields={"visibility": "public"},
            expected_error=(
                "'public' is not one of ['private', 'visible to all']"
            ),
        )

    def test_datasets_create_field_has_wrong_type(
        self, client, header_admin, header, project_fields, dataset_fields
    ):

        add_dataset(
            client,
            header_admin,
            header,
            project_fields,
            dataset_fields,
            overwrite_fields={"samplesCount": "five"},
            expected_error="Samples or Features Count must be numeric",
        )

    def test_datasets_create_missing_dataset_id(
        self, client, header_admin, header, project_fields, dataset_fields
    ):

        add_dataset(
            client,
            header_admin,
            header,
            project_fields,
            dataset_fields,
            overwrite_fields={"id": None},
            expected_error="id not in request data",
        )

    def test_datasets_create_id_empty(
        self, client, header_admin, header, project_fields, dataset_fields
    ):

        add_dataset(
            client,
            header_admin,
            header,
            project_fields,
            dataset_fields,
            overwrite_fields={"id": ""},
            expected_error="an empty string not accepted",
        )

    def test_datasets_create_field_is_missing(
        self,
        client,
        header_admin,
        header,
        project_fields,
        dataset_fields,
    ):
        for field in dataset_fields:
            expected_error = "At least one required field is empty/unselected"

            if field == "project_id":
                expected_error = "project_id is missing"

            if field == "id":
                expected_error = "id not in request data"

            add_dataset(
                client,
                header_admin,
                header,
                project_fields,
                dataset_fields,
                expected_error=expected_error,
                field_to_be_deleted=field,
            )

    def test_datasets_create_mandatory_field_contains_empty_string(
        self,
        client,
        header_admin,
        header,
        project_fields,
        dataset_fields,
        datasets_fields_mandatory_and_string,
    ):

        expected_err = "At least one required field is empty/unselected"

        for field in ["id", "project_id"]:
            datasets_fields_mandatory_and_string.remove(field)

        for field in datasets_fields_mandatory_and_string:
            add_dataset(
                client,
                header_admin,
                header,
                project_fields,
                dataset_fields,
                overwrite_fields={field: ""},
                expected_error=expected_err,
            )

    def test_datasets_create_project_not_exist(
        self, client, header, header_admin, dataset_fields, project_fields
    ):

        add_dataset(
            client,
            header_admin,
            header,
            project_fields,
            dataset_fields,
            project_id="TestX",
            create_project=False,
            expected_error="project not exist",
        )

    def test_dataset_already_exist(
        self, client, header_admin, header, project_fields, dataset_fields
    ):

        # scenario:
        # make sure that it is impossible
        # to create a dataset with a duplicate id
        # (= because the dataset_id already exists for that group)
        # => meaning the combination of group_id and dataset_id must be unique

        dataset_id = str(uuid.uuid4())

        for error in [None, f"{dataset_id} already exists"]:
            add_dataset(
                client,
                header_admin,
                header,
                project_fields,
                dataset_fields,
                dataset_id=dataset_id,
                expected_error=error,
            )


class TestDatasetList:
    def test_datasets_list(
        self, client, header, header_admin, project_fields, dataset_fields
    ):

        ds_ids = []
        project_id = str(uuid.uuid4())

        for create_project in [True, False]:
            dataset_id = str(uuid.uuid4())
            add_dataset(
                client,
                header_admin,
                header,
                project_fields,
                dataset_fields,
                dataset_id=dataset_id,
                project_id=project_id,
                create_project=create_project,
            )
            ds_ids.append(dataset_id)

        data = {"dataset_id": "", "project_id": project_id}
        res = req_post(client, header, "datasets/list", data)
        response = json.loads(res.data.decode("utf8"))

        assert len(response) == len(ds_ids)
        assert set(response) == set(ds_ids)

    def test_datasets_list_filter(
        self, client, header, header_admin, project_fields, dataset_fields
    ):

        ds_ids = []
        project_id = str(uuid.uuid4())

        for create_project in [True, False]:
            dataset_id = str(uuid.uuid4())
            add_dataset(
                client,
                header_admin,
                header,
                project_fields,
                dataset_fields,
                dataset_id=dataset_id,
                project_id=project_id,
                create_project=create_project,
            )
            ds_ids.append(dataset_id)

        data = {"dataset_id": ds_ids[0], "project_id": project_id}
        res = req_post(client, header, "datasets/list", data)
        response = json.loads(res.data.decode("utf8"))

        assert len(response) == 1
        assert response == [ds_ids[0]]

    def test_datasets_list_filter_project_not_exist(
        self, client, header, header_admin, project_fields, dataset_fields
    ):

        ds_ids = []
        project_id = str(uuid.uuid4())

        for create_project in [True, False]:
            dataset_id = str(uuid.uuid4())
            add_dataset(
                client,
                header_admin,
                header,
                project_fields,
                dataset_fields,
                dataset_id=dataset_id,
                project_id=project_id,
                create_project=create_project,
            )
            ds_ids.append(dataset_id)

        data = {"dataset_id": ds_ids[0], "project_id": "testX"}
        res = req_post(client, header, "datasets/list", data)
        response = json.loads(res.data.decode("utf8"))

        assert "no access to that project" in response["message"]

    def test_datasets_list_group_not_exist(self, client, header_3):

        data = {"dataset_id": ""}
        res = req_post(client, header_3, "datasets/list", data)
        assert 404 == res.status_code

        response = json.loads(res.data.decode("utf8"))
        assert "group not exist" in response["message"]


class TestDatasetView:
    def test_get_datasets_view_cols(self, client, header):

        res = req_get(client, header, "datasets/viewcols")
        response = json.loads(res.data.decode("utf8"))

        assert "headers" in response[0]
        assert 26 == len(response[0]["headers"])

    def test_datasets_view(
        self,
        client,
        header_admin,
        header,
        header_2,
        dataset_fields,
        project_fields,
        view_query,
    ):

        ds_ids = []
        for head in [header, header_2]:

            dataset_id = str(uuid.uuid4())
            add_dataset(
                client,
                header_admin,
                head,
                project_fields,
                dataset_fields,
                dataset_id=dataset_id,
            )
            ds_ids.append(dataset_id)

        responses = {}
        for e in [(header, 1), (header_2, 2)]:
            res = req_post(
                client,
                e[0],
                dataset_view_url_suffix,
                view_query,
            )
            responses[e[1]] = json.loads(res.data.decode("utf8"))

        assert "items" in responses[1]
        # number of dataset table fields
        assert 30 == len(responses[1]["items"][0])

        # number of datasets
        assert responses[1]["_meta"]["total_items"] > 0
        assert responses[2]["_meta"]["total_items"] > 0

        assert ds_ids[0] in [
            item["dataset_id"] for item in responses[1]["items"]
        ]
        assert ds_ids[1] in [
            item["dataset_id"] for item in responses[2]["items"]
        ]

    def test_datasets_view_group_not_yet_exist(
        self, client, header_5, view_query
    ):

        res = req_post(
            client,
            header_5,
            dataset_view_url_suffix,
            view_query,
        )
        response = json.loads(res.data.decode("utf8"))

        assert "items" in response

        # number of datasets
        assert 0 == response["_meta"]["total_items"]

    # TODO
    # test to make sure that healthyControls included is boolean

    def test_datasets_view_wrong_keys(self, client, header):

        # have a look into marshmallow for request validation
        # https://flask-marshmallow.readthedocs.io/en/latest/

        data = {"key1": 1, "key2": 1}

        response = req_post(
            client,
            header,
            dataset_view_url_suffix,
            data,
        )

        assert 405 == response["status_code"]
        assert "Additional properties are not allowed" in response["message"]

    def test_datasets_view_show_data_policy_file_url(
        self, client, header_admin, header, dataset_fields, project_fields
    ):

        # scenario:
        # create a dataset with a data policy file attached
        # and then check that the data policy file url is returned
        # and visible in the dataset view

        ds_id, aws_key = upload_data_policy_file(
            client, header_admin, header, project_fields, dataset_fields
        )

        res3 = filter_view(
            client,
            header,
            dataset_view_url_suffix,
            [{"id": "dataset_id", "value": ds_id}],
        )

        response3 = json.loads(res3.data.decode("utf8"))
        assert "items" in response3

        url = response3["items"][0]["policy_presigned_url"]
        assert aws_key in url
        assert "X-Amz" in url
        assert "X-Amz-Expires=604800" in url

    def test_datasets_view_regenerate_data_policy_file_url(
        self,
        client,
        header_admin,
        header,
        dataset_fields,
        project_fields,
        db_uri,
    ):

        # scenario:
        # modify the presigned url to be expired and then regenerate it

        ds_id, aws_key = upload_data_policy_file(
            client, header_admin, header, project_fields, dataset_fields
        )

        res = filter_view(
            client,
            header,
            dataset_view_url_suffix,
            [{"id": "dataset_id", "value": ds_id}],
        )
        response = json.loads(res.data.decode("utf8"))
        url = response["items"][0]["policy_presigned_url"]

        # modify the current presigned url to be expired
        url_parts = url.split("&")
        url_parts[2] = "X-Amz-Date=20190101T000000Z"

        val = "&".join(url_parts)
        cmd = (
            "UPDATE datasets "
            "SET extra_cols = "
            "jsonb_set(extra_cols, '{policy_presigned_url}', '\"X\"'::jsonb)"
            "WHERE dataset_id = 'Y';"
        )
        cmd = cmd.replace("X", val)
        cmd = cmd.replace("Y", ds_id)
        modify_db(
            db_uri,
            cmd,
            Dataset,
            {"dataset_id": ds_id},
            ("extra_cols", "policy_presigned_url"),
            url,
        )

        res3 = filter_view(
            client,
            header,
            dataset_view_url_suffix,
            [{"id": "dataset_id", "value": ds_id}],
        )

        response3 = json.loads(res3.data.decode("utf8"))
        assert "items" in response3

        url = response3["items"][0]["policy_presigned_url"]
        assert aws_key in url
        assert "X-Amz" in url
        assert "X-Amz-Expires=604800" in url

    def test_datasets_view_show_clinical_data_file_url(
        self, client, header_admin, header, dataset_fields, project_fields
    ):

        # scenario:
        # create a dataset with a clinical file attached
        # and then check that the clinica data file url is returned
        # and visible in the dataset view

        ds_id, aws_key = upload_clinical_data_file(
            client, header_admin, header, project_fields, dataset_fields
        )

        res3 = filter_view(
            client,
            header,
            dataset_view_url_suffix,
            [{"id": "dataset_id", "value": ds_id}],
        )

        response3 = json.loads(res3.data.decode("utf8"))
        assert "items" in response3

        url = response3["items"][0]["clinical_presigned_url"]
        assert aws_key in url
        assert "X-Amz" in url
        assert "X-Amz-Expires=604800" in url

    def test_datasets_view_regenerate_clinical_data_file_url(
        self,
        client,
        header_admin,
        header,
        dataset_fields,
        project_fields,
        db_uri,
    ):

        # scenario:
        # modify the presigned url to be expired and then regenerate it

        ds_id, aws_key = upload_clinical_data_file(
            client, header_admin, header, project_fields, dataset_fields
        )

        res = filter_view(
            client,
            header,
            dataset_view_url_suffix,
            [{"id": "dataset_id", "value": ds_id}],
        )
        response = json.loads(res.data.decode("utf8"))
        url = response["items"][0]["clinical_presigned_url"]

        # modify the current presigned url to be expired
        url_parts = url.split("&")
        url_parts[2] = "X-Amz-Date=20190101T000000Z"

        val = "&".join(url_parts)
        cmd = (
            "UPDATE datasets "
            "SET extra_cols = "
            "jsonb_set(extra_cols, '{clinical_presigned_url}', '\"X\"'::jsonb)"
            "WHERE dataset_id = 'Y';"
        )
        cmd = cmd.replace("X", val)
        cmd = cmd.replace("Y", ds_id)
        modify_db(
            db_uri,
            cmd,
            Dataset,
            {"dataset_id": ds_id},
            ("extra_cols", "clinical_presigned_url"),
            url,
        )

        res3 = filter_view(
            client,
            header,
            dataset_view_url_suffix,
            [{"id": "dataset_id", "value": ds_id}],
        )

        response3 = json.loads(res3.data.decode("utf8"))
        assert "items" in response3

        url = response3["items"][0]["clinical_presigned_url"]
        assert aws_key in url
        assert "X-Amz" in url
        assert "X-Amz-Expires=604800" in url

    def test_dataset_sort(
        self,
        client,
        header_admin,
        header,
        header_2,
        view_query,
        project_fields,
        dataset_fields,
    ):

        # TODO
        # put all the sorting tests into a single function
        # call it test_sort_by

        dataset_ids = []

        for head in [header, header_2]:
            project_id = str(uuid.uuid4())
            dataset_id = str(uuid.uuid4())
            dataset_ids.append(dataset_id)

            add_dataset(
                client,
                header_admin,
                head,
                project_fields,
                dataset_fields,
                project_id=project_id,
                dataset_id=dataset_id,
                private=False,
            )

        res = filter_view(
            client,
            header,
            dataset_view_url_suffix,
            # None,
        )

        response = json.loads(res.data.decode("utf8"))
        dataset_ids = [item["dataset_id"] for item in response["items"]]

        dataset_ids.sort()

        col = "dataset_id"
        query = view_query

        responses = []
        for desc_bool in [True, False]:
            query["sorted"] = [{"id": col, "desc": desc_bool}]

            res = req_post(
                client,
                header,
                dataset_view_url_suffix,
                query,
            )
            responses.append(json.loads(res.data.decode("utf8")))

        cols_desc = [item["dataset_id"] for item in responses[0]["items"]]
        cols_asc = [item["dataset_id"] for item in responses[1]["items"]]

        assert cols_desc == dataset_ids[::-1]
        assert cols_asc == dataset_ids

    def test_dataset_sort_by_owner(
        self,
        client,
        header_admin,
        header,
        header_2,
        view_query,
        project_fields,
        dataset_fields,
    ):

        # TODO
        # put all the sorting tests into a single function
        # call it sort_by

        for head in [header, header_2]:
            project_id = str(uuid.uuid4())
            dataset_id = str(uuid.uuid4())

            add_dataset(
                client,
                header_admin,
                head,
                project_fields,
                dataset_fields,
                project_id=project_id,
                dataset_id=dataset_id,
                private=False,
            )

        res = filter_view(
            client,
            header,
            dataset_view_url_suffix,
            None,
        )

        response = json.loads(res.data.decode("utf8"))
        owners = [item["owner"] for item in response["items"]]

        owners.sort()

        # either "checkbox" or "owner" can be used to sort
        col = "owner"
        query = view_query

        responses = []
        for desc_bool in [True, False]:
            query["sorted"] = [{"id": col, "desc": desc_bool}]

            res = req_post(
                client,
                header,
                dataset_view_url_suffix,
                query,
            )
            responses.append(json.loads(res.data.decode("utf8")))

        cols_desc = [item["owner"] for item in responses[0]["items"]]
        cols_asc = [item["owner"] for item in responses[1]["items"]]

        assert cols_desc == owners[::-1]
        assert cols_asc == owners

    def test_dataset_sort_by_extra_column_disease(
        self,
        client,
        header_admin,
        header,
        header_2,
        view_query,
        project_fields,
        dataset_fields,
    ):

        # TODO
        # put all the sorting tests into a single function
        # call it sort_by

        for head, disease in [(header, "CD"), (header_2, "ASTHMA")]:
            project_id = str(uuid.uuid4())
            dataset_id = str(uuid.uuid4())

            add_dataset(
                client,
                header_admin,
                head,
                project_fields,
                dataset_fields,
                project_id=project_id,
                dataset_id=dataset_id,
                private=False,
                overwrite_fields={"disease": disease},
            )

        res = filter_view(
            client,
            header,
            dataset_view_url_suffix,
            None,
        )

        response = json.loads(res.data.decode("utf8"))
        diseases = [item["disease"] for item in response["items"]]

        diseases.sort()

        # TODO
        # add a test for sorting
        # which checks if the column
        # can be used for sorting
        # e.g. using the column "owner"
        # instead of the column "checkbox"
        # run into an error

        col = "disease"
        query = view_query

        responses = []
        for desc_bool in [True, False]:
            query["sorted"] = [{"id": col, "desc": desc_bool}]

            res = req_post(
                client,
                header,
                dataset_view_url_suffix,
                query,
            )
            responses.append(json.loads(res.data.decode("utf8")))

        cols_desc = [item["disease"] for item in responses[0]["items"]]
        cols_asc = [item["disease"] for item in responses[1]["items"]]

        assert cols_desc == diseases[::-1]
        assert cols_asc == diseases

    def test_dataset_sort_wrong_keys(self, client, header, view_query):

        # have a look into marshmallow for request validation
        # https://flask-marshmallow.readthedocs.io/en/latest/

        col = "id"
        query = view_query
        query["sorted"] = [{"col_id": col, "desc": True}]

        response = req_post(
            client,
            header,
            dataset_view_url_suffix,
            query,
        )

        # TODO
        # it would be good if the return is a little bit more informative
        # e.g. which key is wrong
        assert (
            "At least one required field is empty/unselected"
            in response["message"]
        )
        # assert "'id' is a required property" in response["message"]

    def test_dataset_sort_col_not_exist(self, client, header, view_query):

        col = "col1"
        query = view_query
        query["sorted"] = [{"id": col, "desc": True}]

        response = req_post(
            client,
            header,
            dataset_view_url_suffix,
            query,
        )
        assert f"{col} not allowed in request data" in response["message"]

    def test_dataset_filter_full_match(
        self,
        client,
        header_admin,
        header,
        header_2,
        view_query,
        project_fields,
        dataset_fields,
    ):

        # FIXME
        # add a test for the wrong filter format
        # wrong:
        # [{"dataset_id": dataset_id}],

        # TODO
        # filter by partial match is missing

        dataset_ids = [str(uuid.uuid4()) for _ in range(2)]

        val = dataset_ids[0]
        col = "dataset_id"

        filter_by(
            col,
            val,
            client,
            header_admin,
            header,
            header_2,
            project_fields,
            dataset_fields,
            dataset_view_url_suffix,
            dataset_ids=dataset_ids,
        )

    def test_dataset_filter_by_owner(
        self,
        client,
        header_admin,
        header,
        header_2,
        view_query,
        project_fields,
        dataset_fields,
    ):

        val = "cnag"
        col = "owner"

        filter_by(
            col,
            val,
            client,
            header_admin,
            header,
            header_2,
            project_fields,
            dataset_fields,
            dataset_view_url_suffix,
        )

    def test_dataset_filter_by_project_id(
        self,
        client,
        header_admin,
        header,
        header_2,
        project_fields,
        dataset_fields,
    ):

        project_ids = [str(uuid.uuid4()) for _ in range(2)]

        val = project_ids[0]
        col = "project_id"

        filter_by(
            col,
            val,
            client,
            header_admin,
            header,
            header_2,
            project_fields,
            dataset_fields,
            dataset_view_url_suffix,
            project_ids=project_ids,
        )

    def test_dataset_filter_by_visibility_only_private(
        self,
        client,
        header_admin,
        header,
        header_2,
        dataset_fields,
        project_fields,
    ):

        val = "private"
        col = "visibility"

        filter_by(
            col,
            val,
            client,
            header_admin,
            header,
            header_2,
            project_fields,
            dataset_fields,
            dataset_view_url_suffix,
            dataset_private=[True, False],
        )

    def test_dataset_filter_wrong_keys(self, client, header, view_query):

        # have a look into marshmallow for request validation
        # https://flask-marshmallow.readthedocs.io/en/latest/

        col = "id"
        query = view_query
        query["filtered"] = [{"col_id": col, "value": "test"}]

        response = req_post(
            client,
            header,
            dataset_view_url_suffix,
            query,
        )

        # TODO
        # it would be good if the return is a little bit more informative
        # e.g. which key is wrong
        assert (
            "At least one required field is empty/unselected"
            in response["message"]
        )
        # assert "'id' is a required property" in response["message"]

    def test_dataset_filter_col_not_exist(self, client, header, view_query):

        col = "col1"
        query = view_query
        query["filtered"] = [{"id": col, "value": "test"}]

        response = req_post(
            client,
            header,
            dataset_view_url_suffix,
            query,
        )

        assert f"{col} not allowed in request data" in response["message"]

    def test_dataset_filter_query_not_a_list(self, client, header, view_query):

        col = "id"
        query = view_query
        query["filtered"] = {"id": col, "value": "test"}

        response = req_post(
            client,
            header,
            dataset_view_url_suffix,
            query,
        )

        assert "is not of type 'array'" in response["message"]

    def test_dataset_filter_by_submit_date(
        self,
        client,
        header_admin,
        header,
        header_2,
        view_query,
        project_fields,
        dataset_fields,
    ):

        val = datetime.now().strftime("%Y/%m/%d")
        col = "submit_date"

        filter_by(
            col,
            val,
            client,
            header_admin,
            header,
            header_2,
            project_fields,
            dataset_fields,
            dataset_view_url_suffix,
            partial_match=True,
        )

    def test_dataset_filter_by_submit_date_time(
        self,
        client,
        header_admin,
        header,
        header_2,
        view_query,
        project_fields,
        dataset_fields,
    ):

        time_points = []

        for head in [header, header_2]:
            project_id = str(uuid.uuid4())
            dataset_id = str(uuid.uuid4())

            time_points.append(
                datetime.utcnow().strftime("%Y/%m/%d, %H:%M:%S")
            )
            add_dataset(
                client,
                header_admin,
                head,
                project_fields,
                dataset_fields,
                project_id=project_id,
                dataset_id=dataset_id,
                private=False,
            )
            time.sleep(1)

        col = "submit_date"
        val = time_points[0]

        filter_by(
            col,
            val,
            client,
            header_admin,
            header,
            header_2,
            project_fields,
            dataset_fields,
            dataset_view_url_suffix,
            partial_match=False,
            create_dataset=False,
        )

    def test_dataset_filter_by_submit_date_wrong_format(
        self,
        client,
        header_admin,
        header,
        header_2,
        view_query,
        project_fields,
        dataset_fields,
    ):

        val = datetime.now().strftime("%Y/%m/%d/%H:%M:%S")
        col = "submit_date"

        filter_by(
            col,
            val,
            client,
            header_admin,
            header,
            header_2,
            project_fields,
            dataset_fields,
            dataset_view_url_suffix,
            expected_error=("wrong format not accepted for column date_time"),
        )

    def test_dataset_filter_by_extra_cols_disease(
        self,
        client,
        header_admin,
        header,
        header_2,
        view_query,
        project_fields,
        dataset_fields,
    ):

        val = "ASTHMA"
        col = "disease"

        overwrite_fields = [{col: "ASTHMA"}, {col: "COPD"}]

        filter_by(
            col,
            val,
            client,
            header_admin,
            header,
            header_2,
            project_fields,
            dataset_fields,
            dataset_view_url_suffix,
            overwrite_fields=overwrite_fields,
        )

    # TODO
    # filter by extra cols Sample/Feature Count

    # FIXME
    # healthy controls included column is not even visible in the frontend
    # there seems to be a wrong mapping between the frontend and the backend

    # FIXME
    # filtering by the "shared with" column does not work

    def test_dataset_filter_by_extra_cols_controls_included(
        self,
        client,
        header_admin,
        header,
        header_2,
        view_query,
        project_fields,
        dataset_fields,
    ):

        val = "False"
        col = "healthyControllsIncluded"

        overwrite_fields = [{col: True}, {col: False}]

        filter_by(
            col,
            val,
            client,
            header_admin,
            header,
            header_2,
            project_fields,
            dataset_fields,
            dataset_view_url_suffix,
            overwrite_fields=overwrite_fields,
        )

    def test_dataset_filter_by_dataset_name(
        self,
        client,
        header_admin,
        header,
        header_2,
        project_fields,
        dataset_fields,
    ):

        val = str(uuid.uuid4())
        col = "name"

        overwrite_fields = [
            {col: val},
            {col: str(uuid.uuid4())},
        ]

        filter_by(
            col,
            val,
            client,
            header_admin,
            header,
            header_2,
            project_fields,
            dataset_fields,
            dataset_view_url_suffix,
            overwrite_fields=overwrite_fields,
        )

    def test_dataset_filter_by_extra_cols_samples_count(
        self,
        client,
        header_admin,
        header,
        header_2,
        project_fields,
        dataset_fields,
    ):

        col = "samplesCount"
        val = str(randint(2, 100))

        overwrite_fields = [
            {col: "1"},
            {col: val},
        ]

        filter_by(
            col,
            val,
            client,
            header_admin,
            header,
            header_2,
            project_fields,
            dataset_fields,
            dataset_view_url_suffix,
            overwrite_fields=overwrite_fields,
        )

    def test_dataset_filter_value_type_mismatch(
        self,
        client,
        header_admin,
        header,
        header_2,
        project_fields,
        dataset_fields,
    ):

        # FIXME
        # at the moment the app fails when you try to filter
        # e.g. a column which expects a string

        col = "name"
        vals = [True, 10]

        filter_by(
            col,
            vals[0],
            client,
            header_admin,
            header,
            header_2,
            project_fields,
            dataset_fields,
            dataset_view_url_suffix,
            expected_error=("boolean is not allowed"),
        )

        filter_by(
            col,
            vals[1],
            client,
            header_admin,
            header,
            header_2,
            project_fields,
            dataset_fields,
            dataset_view_url_suffix,
            expected_error=("integer is not allowed"),
        )


class TestDatasetShare:
    def test_dataset_put_arg_not_exist(self, client, header):

        group = "crg"

        project_id = str(uuid.uuid4())
        dataset_id = str(uuid.uuid4())

        arg = "argument"

        res = req_put(
            client,
            header,
            "datasets?arg=" + arg,
            [
                f"project={project_id}",
                f"dataset={dataset_id}",
                f"group={group}",
            ],
        )

        response = json.loads(res.data.decode("utf8"))

        assert 405 == res.status_code
        assert "arg forbidden" in response["message"]

    def test_dataset_share_group_not_exist(self, client, header_3):

        group = "crg"

        project_id = str(uuid.uuid4())
        dataset_id = str(uuid.uuid4())

        res = req_put(
            client,
            header_3,
            dataset_add_group_url_suffix,
            [
                f"project={project_id}",
                f"dataset={dataset_id}",
                f"group={group}",
            ],
        )

        response = json.loads(res.data.decode("utf8"))

        assert 404 == res.status_code
        assert "group not found" in response["message"]

    def test_dataset_share_group_not_valid(
        self, client, header_admin, header, project_fields, dataset_fields
    ):

        group = "embl"

        project_id = str(uuid.uuid4())
        dataset_id = str(uuid.uuid4())

        add_dataset(
            client,
            header_admin,
            header,
            project_fields,
            dataset_fields,
            project_id=project_id,
            dataset_id=dataset_id,
        )

        response = req_put(
            client,
            header,
            dataset_add_group_url_suffix,
            [
                f"project={project_id}",
                f"dataset={dataset_id}",
                f"group={group}",
            ],
        )

        assert 405 == response["status_code"]
        assert "embl is not a valid group" in response["message"]

    def test_dataset_share_with_one_group(
        self,
        client,
        header_admin,
        header,
        header_3,
        project_fields,
        dataset_fields,
    ):

        # ! FIXME
        # fails when all test are executed at the same time

        # TODO
        # get the group id from the header_3 by decoding the token
        group = "crg"

        project_id = str(uuid.uuid4())
        dataset_id = str(uuid.uuid4())

        add_dataset(
            client,
            header_admin,
            header,
            project_fields,
            dataset_fields,
            project_id=project_id,
            dataset_id=dataset_id,
        )

        # before sharing
        res = filter_view(
            client,
            header,
            dataset_view_url_suffix,
            [{"id": "dataset_id", "value": dataset_id}],
        )
        response = json.loads(res.data.decode("utf8"))
        assert 1 == response["_meta"]["total_items"]
        assert response["items"][0]["isUserOwner"]

        res2 = filter_view(
            client,
            header_3,
            dataset_view_url_suffix,
            [{"id": "dataset_id", "value": dataset_id}],
        )
        response2 = json.loads(res2.data.decode("utf8"))
        assert 0 == response2["_meta"]["total_items"]

        res3 = req_put(
            client,
            header,
            dataset_add_group_url_suffix,
            [
                f"project={project_id}",
                f"dataset={dataset_id}",
                f"group={group}",
            ],
        )
        response3 = json.loads(res3.data.decode("utf8"))
        assert msg_groups_updated in response3["message"]

        # after sharing
        res4 = filter_view(
            client,
            header,
            dataset_view_url_suffix,
            [{"id": "dataset_id", "value": dataset_id}],
        )
        response4 = json.loads(res4.data.decode("utf8"))

        res5 = filter_view(
            client,
            header_3,
            dataset_view_url_suffix,
            [{"id": "dataset_id", "value": dataset_id}],
        )
        response5 = json.loads(res5.data.decode("utf8"))

        assert 1 == response5["_meta"]["total_items"]
        assert "items" in response5

        # sharing should not affect the returned "isUserOwner" value
        assert response4["items"][0]["isUserOwner"]
        assert not response5["items"][0]["isUserOwner"]

        assert "3tr" == response5["items"][0]["owner"]
        assert "crg" == response5["items"][0]["shared_with"]

    def test_dataset_share_group_not_exist_yet(
        self,
        client,
        header_admin,
        header,
        header_4,
        project_fields,
        dataset_fields,
    ):

        # TODO
        # get the group id from the header_4 by decoding the token
        group = "granada"

        project_id = str(uuid.uuid4())
        dataset_id = str(uuid.uuid4())

        add_dataset(
            client,
            header_admin,
            header,
            project_fields,
            dataset_fields,
            project_id=project_id,
            dataset_id=dataset_id,
        )

        res2 = req_put(
            client,
            header,
            dataset_add_group_url_suffix,
            [
                f"project={project_id}",
                f"dataset={dataset_id}",
                f"group={group}",
            ],
        )
        response2 = json.loads(res2.data.decode("utf8"))
        assert msg_groups_updated in response2["message"]

        # after sharing
        res3 = filter_view(
            client,
            header_4,
            dataset_view_url_suffix,
            [{"id": "dataset_id", "value": dataset_id}],
        )
        response3 = json.loads(res3.data.decode("utf8"))

        assert 1 == response3["_meta"]["total_items"]
        assert "items" in response3
        assert not response3["items"][0]["isUserOwner"]
        assert "3tr" == response3["items"][0]["owner"]
        assert "granada" == response3["items"][0]["shared_with"]

    def test_dataset_share_user_not_owner(
        self,
        client,
        header_admin,
        header,
        header_3,
        view_query,
        project_fields,
        dataset_fields,
    ):
        # header_3 (crg) tries to share a dataset with header_2(cnag)
        # although header(3tr) is the owner of the dataset

        group = "cnag"

        project_id = str(uuid.uuid4())
        dataset_id = str(uuid.uuid4())

        add_dataset(
            client,
            header_admin,
            header,
            project_fields,
            dataset_fields,
            project_id=project_id,
            dataset_id=dataset_id,
        )

        res = filter_view(
            client,
            header,
            dataset_view_url_suffix,
            None,
        )
        response = json.loads(res.data.decode("utf8"))
        assert dataset_id in [item["dataset_id"] for item in response["items"]]

        res2 = filter_view(
            client,
            header_3,
            dataset_view_url_suffix,
            None,
        )
        response2 = json.loads(res2.data.decode("utf8"))
        assert "items" in response2

        res3 = req_put(
            client,
            header_3,
            dataset_add_group_url_suffix,
            [
                f"project={project_id}",
                f"dataset={dataset_id}",
                f"group={group}",
            ],
        )
        response3 = json.loads(res3.data.decode("utf8"))
        assert "dataset not exist" in response3["message"]

    def test_dataset_unshare_user_not_owner(
        self,
        client,
        header_admin,
        header,
        header_3,
        project_fields,
        dataset_fields,
    ):
        # header_3 (crg) tries to unshare a dataset with header_2(cnag)
        # although header(3tr) is the owner of the dataset

        group = "cnag"

        project_id = str(uuid.uuid4())
        dataset_id = str(uuid.uuid4())

        add_dataset(
            client,
            header_admin,
            header,
            project_fields,
            dataset_fields,
            project_id=project_id,
            dataset_id=dataset_id,
        )

        res = filter_view(client, header, dataset_view_url_suffix)
        response = json.loads(res.data.decode("utf8"))
        assert dataset_id in [item["dataset_id"] for item in response["items"]]

        res2 = filter_view(client, header_3, dataset_view_url_suffix)
        response2 = json.loads(res2.data.decode("utf8"))
        assert "items" in response2

        res3 = req_put(
            client,
            header_3,
            dataset_remove_group_url_suffix,
            [
                f"project={project_id}",
                f"dataset={dataset_id}",
                f"group={group}",
            ],
        )
        response3 = json.loads(res3.data.decode("utf8"))
        assert "dataset not exist" in response3["message"]

    def test_dataset_share_same_dataset_id(
        self,
        client,
        header_admin,
        header,
        header_2,
        header_3,
        project_fields,
        dataset_fields,
    ):

        # scenario
        # user1 (3tr) has uploaded a dataset w/ a random id"
        # user2 (cnag) has uploaded a dataset w/ the same id
        # user1 (3tr) has shared the dataset with user2 (cnag)
        # user2 (cnag) wants to share the dataset with ALL users

        # expected
        # The dataset of user1 should be only shared with user2
        # The dataset of user2 should be shared with ALL users
        # user3 should be a able to see the dataset of user2
        # but not the one of user1

        dataset_id = str(uuid.uuid4())

        for head, group in [(header, "cnag"), (header_2, "ALL")]:
            project_id = str(uuid.uuid4())

            add_dataset(
                client,
                header_admin,
                head,
                project_fields,
                dataset_fields,
                project_id=project_id,
                dataset_id=dataset_id,
            )

            res = filter_view(
                client,
                header,
                dataset_view_url_suffix,
                [{"id": "dataset_id", "value": dataset_id}],
            )

            response = json.loads(res.data.decode("utf8"))
            assert group not in response["items"][0]["shared_with"]
            assert "private" == response["items"][0]["visibility"]

            res2 = req_put(
                client,
                head,
                dataset_add_group_url_suffix,
                [
                    f"project={project_id}",
                    f"dataset={dataset_id}",
                    f"group={group}",
                ],
            )

            response2 = json.loads(res2.data.decode("utf8"))
            assert msg_groups_updated in response2["message"]

        res3 = filter_view(
            client,
            header_2,
            dataset_view_url_suffix,
            [{"id": "dataset_id", "value": dataset_id}],
        )

        response3 = json.loads(res3.data.decode("utf8"))

        assert "cnag" == response3["items"][0]["shared_with"]
        assert "private" == response3["items"][0]["visibility"]
        assert "3tr" == response3["items"][0]["owner"]

        assert "ALL GROUPS" == response3["items"][1]["shared_with"]
        assert "visible to all" == response3["items"][1]["visibility"]
        assert "cnag" == response3["items"][1]["owner"]

        res4 = filter_view(
            client,
            header_3,
            dataset_view_url_suffix,
            [{"id": "dataset_id", "value": dataset_id}],
        )

        response4 = json.loads(res4.data.decode("utf8"))
        assert 1 == len(response4["items"])
        assert "ALL GROUPS" == response4["items"][0]["shared_with"]

    def test_dataset_unshare_same_dataset_id(
        self,
        client,
        header_admin,
        header,
        header_2,
        dataset_fields,
        project_fields,
    ):

        # scenario

        # preparation
        # user1 (3tr) has uploaded a dataset w/ a random id"
        # user2 (cnag) has uploaded a dataset w/ the same id
        # user1 (3tr) has shared the dataset with user2 (cnag)
        # user2 (cnag) wants to share the dataset with ALL users

        # test
        # user1 (3tr) wants to unshare the dataset with user2 (cnag)
        # user2 (cnag) wants to unshare the dataset with ALL users

        # expected
        # The dataset of user1 should be unshared with user2 (cnag)
        # The dataset of user2 should be unshared with ALL users

        dataset_id = str(uuid.uuid4())
        project_ids = []

        for head, group in [(header, "cnag"), (header_2, "ALL")]:
            project_id = str(uuid.uuid4())
            project_ids.append(project_id)

            add_dataset(
                client,
                header_admin,
                head,
                project_fields,
                dataset_fields,
                project_id=project_id,
                dataset_id=dataset_id,
            )

            res = filter_view(
                client,
                header,
                dataset_view_url_suffix,
                [{"id": "dataset_id", "value": dataset_id}],
            )

            response = json.loads(res.data.decode("utf8"))
            assert group not in response["items"][0]["shared_with"]

            res2 = req_put(
                client,
                head,
                dataset_add_group_url_suffix,
                [
                    f"project={project_id}",
                    f"dataset={dataset_id}",
                    f"group={group}",
                ],
            )

            response2 = json.loads(res2.data.decode("utf8"))
            assert msg_groups_updated in response2["message"]

        res3 = filter_view(
            client,
            header_2,
            dataset_view_url_suffix,
            [{"id": "dataset_id", "value": dataset_id}],
        )

        response3 = json.loads(res3.data.decode("utf8"))

        assert "cnag" == response3["items"][0]["shared_with"]
        assert "3tr" == response3["items"][0]["owner"]

        assert "ALL GROUPS" == response3["items"][1]["shared_with"]
        assert "cnag" == response3["items"][1]["owner"]

        i = 0
        for head, group in [(header, "cnag"), (header_2, "ALL")]:
            res4 = req_put(
                client,
                head,
                dataset_remove_group_url_suffix,
                [
                    f"project={project_ids[i]}",
                    f"dataset={dataset_id}",
                    f"group={group}",
                ],
            )

            response4 = json.loads(res4.data.decode("utf8"))
            assert msg_groups_updated in response4["message"]

            res5 = filter_view(
                client,
                header,
                dataset_view_url_suffix,
                [{"id": "dataset_id", "value": dataset_id}],
            )

            response5 = json.loads(res5.data.decode("utf8"))
            assert group not in response5["items"][0]["shared_with"]
            i += 1

    def test_dataset_unshare_owner(
        self, client, header_admin, header, project_fields, dataset_fields
    ):

        # Make sure that you cannot unshare
        # if the users's kc group is owner

        group = "3tr"

        project_id = str(uuid.uuid4())
        dataset_id = str(uuid.uuid4())

        add_dataset(
            client,
            header_admin,
            header,
            project_fields,
            dataset_fields,
            project_id=project_id,
            dataset_id=dataset_id,
        )

        res = req_put(
            client,
            header,
            dataset_remove_group_url_suffix,
            [
                f"project={project_id}",
                f"dataset={dataset_id}",
                f"group={group}",
            ],
        )
        response = json.loads(res.data.decode("utf8"))

        assert "group is owner" in response["message"]

    def test_dataset_share_dataset_not_exist(
        self, client, header_admin, header, project_fields
    ):

        group = "cnag"
        project_id = str(uuid.uuid4())
        dataset_id = str(uuid.uuid4())

        add_project(
            client,
            header_admin,
            project_id,
            project_fields,
            projects_create_url_suffix,
        )

        res = filter_view(
            client,
            header,
            dataset_view_url_suffix,
            [{"id": "dataset_id", "value": dataset_id}],
        )

        response = json.loads(res.data.decode("utf8"))
        assert 0 == len(response["items"])

        res = req_put(
            client,
            header,
            dataset_add_group_url_suffix,
            [
                f"project={project_id}",
                f"dataset={dataset_id}",
                f"group={group}",
            ],
        )
        response = json.loads(res.data.decode("utf8"))

        assert 404 == res.status_code
        assert "dataset not exist" in response["message"]

    def test_dataset_share_project_not_exist(self, client, header):

        group = "cnag"

        project_id = str(uuid.uuid4())
        dataset_id = str(uuid.uuid4())

        res = filter_view(
            client,
            header,
            dataset_view_url_suffix,
            [{"id": "dataset_id", "value": dataset_id}],
        )

        response = json.loads(res.data.decode("utf8"))
        assert 0 == len(response["items"])

        res = req_put(
            client,
            header,
            dataset_add_group_url_suffix,
            [
                f"project={project_id}",
                f"dataset={dataset_id}",
                f"group={group}",
            ],
        )
        response = json.loads(res.data.decode("utf8"))

        assert 404 == res.status_code
        assert "project not found" in response["message"]

    def test_dataset_shared_with_group_not_yet_in_db(
        self,
        client,
        header_admin,
        header,
        dataset_fields,
        project_fields,
        db_uri,
    ):

        # scenario:
        # share with a group that is not yet in the db

        # test only works if group5 is not in the database
        cmd = "DELETE FROM public.group WHERE kc_groupname='group5'"
        del_from_db(db_uri, cmd)

        group = "group5"

        project_id = str(uuid.uuid4())
        dataset_id = str(uuid.uuid4())

        add_dataset(
            client,
            header_admin,
            header,
            project_fields,
            dataset_fields,
            project_id=project_id,
            dataset_id=dataset_id,
        )

        res = filter_view(
            client,
            header,
            dataset_view_url_suffix,
            [{"id": "dataset_id", "value": dataset_id}],
        )

        response = json.loads(res.data.decode("utf8"))
        assert group not in response["items"][0]["shared_with"]
        assert "private" == response["items"][0]["visibility"]

        res2 = req_put(
            client,
            header,
            dataset_add_group_url_suffix,
            [
                f"project={project_id}",
                f"dataset={dataset_id}",
                f"group={group}",
            ],
        )

        response2 = json.loads(res2.data.decode("utf8"))
        assert msg_groups_updated in response2["message"]

        res3 = filter_view(
            client,
            header,
            dataset_view_url_suffix,
            [{"id": "dataset_id", "value": dataset_id}],
        )

        response3 = json.loads(res3.data.decode("utf8"))
        assert group in response3["items"][0]["shared_with"]

        res4 = req_put(
            client,
            header,
            dataset_add_group_url_suffix,
            [
                f"project={project_id}",
                f"dataset={dataset_id}",
                f"group={group}",
            ],
        )

        response4 = json.loads(res4.data.decode("utf8"))
        assert msg_groups_updated in response4["message"]

    def test_dataset_already_shared_with_group(
        self, client, header_admin, header, dataset_fields, project_fields
    ):
        # when the dataset is already shared with the group
        # it should just continue the loop and not raise an error

        group = "cnag"

        project_id = str(uuid.uuid4())
        dataset_id = str(uuid.uuid4())

        add_dataset(
            client,
            header_admin,
            header,
            project_fields,
            dataset_fields,
            project_id=project_id,
            dataset_id=dataset_id,
        )

        res = filter_view(
            client,
            header,
            dataset_view_url_suffix,
            [{"id": "dataset_id", "value": dataset_id}],
        )

        response = json.loads(res.data.decode("utf8"))
        assert group not in response["items"][0]["shared_with"]
        assert "private" == response["items"][0]["visibility"]

        res2 = req_put(
            client,
            header,
            dataset_add_group_url_suffix,
            [
                f"project={project_id}",
                f"dataset={dataset_id}",
                f"group={group}",
            ],
        )

        response2 = json.loads(res2.data.decode("utf8"))
        assert msg_groups_updated in response2["message"]

        res3 = filter_view(
            client,
            header,
            dataset_view_url_suffix,
            [{"id": "dataset_id", "value": dataset_id}],
        )

        response3 = json.loads(res3.data.decode("utf8"))
        assert group in response3["items"][0]["shared_with"]

        res4 = req_put(
            client,
            header,
            dataset_add_group_url_suffix,
            [
                f"project={project_id}",
                f"dataset={dataset_id}",
                f"group={group}",
            ],
        )

        response4 = json.loads(res4.data.decode("utf8"))
        assert msg_groups_updated in response4["message"]

    def test_dataset_unshare_group_not_in_shared_with(
        self, client, header_admin, header, dataset_fields, project_fields
    ):
        # scenario:
        # when the group is not in the shared_with list
        # it should just continue the loop and not raise an error

        group = "cnag"
        group2 = "group5"

        project_id = str(uuid.uuid4())
        dataset_id = str(uuid.uuid4())

        add_dataset(
            client,
            header_admin,
            header,
            project_fields,
            dataset_fields,
            project_id=project_id,
            dataset_id=dataset_id,
        )

        res = filter_view(
            client,
            header,
            dataset_view_url_suffix,
            [{"id": "dataset_id", "value": dataset_id}],
        )

        response = json.loads(res.data.decode("utf8"))
        assert group not in response["items"][0]["shared_with"]
        assert "private" == response["items"][0]["visibility"]

        res2 = req_put(
            client,
            header,
            dataset_add_group_url_suffix,
            [
                f"project={project_id}",
                f"dataset={dataset_id}",
                f"group={group}",
            ],
        )

        response2 = json.loads(res2.data.decode("utf8"))
        assert msg_groups_updated in response2["message"]

        res3 = filter_view(
            client,
            header,
            dataset_view_url_suffix,
            [{"id": "dataset_id", "value": dataset_id}],
        )

        response3 = json.loads(res3.data.decode("utf8"))
        assert group in response3["items"][0]["shared_with"]

        res4 = req_put(
            client,
            header,
            dataset_remove_group_url_suffix,
            [
                f"project={project_id}",
                f"dataset={dataset_id}",
                f"group={group2}",
            ],
        )

        response4 = json.loads(res4.data.decode("utf8"))
        assert msg_groups_updated in response4["message"]

    def test_dataset_share_dataset_visibility_changeable_false(
        self, client, header_admin, header_5, project_fields, dataset_fields
    ):

        # scenario:
        # make sure that you cannot share a dataset if
        # dataset visibility changeable is set to false

        test = ["cnag"]

        proj_id = str(uuid.uuid4())
        dataset_id = str(uuid.uuid4())

        data = add_project(
            client,
            header_admin,
            proj_id,
            project_fields,
            projects_create_url_suffix,
            submit=False,
        )

        data["owners"] = "group5"
        data["datasetVisibilityChangeable"] = False

        res = req_post(
            client, header_admin, projects_create_url_suffix, [data]
        )
        response = json.loads(res.data.decode("utf8"))
        assert "project inserted" in response["message"]

        # create a dataset
        add_dataset(
            client,
            header_admin,
            header_5,
            project_fields,
            dataset_fields,
            dataset_id=dataset_id,
            project_id=proj_id,
            create_project=False,
        )

        res2 = filter_view(
            client,
            header_5,
            dataset_view_url_suffix,
            [{"id": "dataset_id", "value": dataset_id}],
        )

        response2 = json.loads(res2.data.decode("utf8"))
        assert "private" == response2["items"][0]["visibility"]

        # try to change the datasets visibility
        res3 = req_put(
            client,
            header_5,
            dataset_add_group_url_suffix,
            [
                f"project={proj_id}",
                f"dataset={dataset_id}",
                f"group={test[0]}",
            ],
        )

        response3 = json.loads(res3.data.decode("utf8"))
        assert "dataset visibility is not changeable" == response3["message"]


class TestDatasetAdminView:
    def test_file_admin_view_user_not_admin(self, client, header, view_query):

        res = req_post(client, header, dataset_admin_view_suffix, view_query)

        response = json.loads(res.data.decode("utf8"))
        assert response["message"] == "Only admin users can view datasets"

    def test_dataset_admin_view(
        self,
        client,
        header_admin,
        header,
        project_fields,
        dataset_fields,
        view_query,
    ):

        project_id = str(uuid.uuid4())
        dataset_id = str(uuid.uuid4())

        add_dataset(
            client,
            header_admin,
            header,
            project_fields,
            dataset_fields,
            dataset_id=dataset_id,
            project_id=project_id,
        )

        res = req_post(
            client, header_admin, dataset_admin_view_suffix, view_query
        )

        response = json.loads(res.data.decode("utf8"))
        assert response["_meta"]["total_items"] > 0

    def test_dataset_admin_view_wrong_schema(
        self,
        client,
        header_admin,
        header,
        project_fields,
        dataset_fields,
        view_query,
    ):

        project_id = str(uuid.uuid4())
        dataset_id = str(uuid.uuid4())

        add_dataset(
            client,
            header_admin,
            header,
            project_fields,
            dataset_fields,
            dataset_id=dataset_id,
            project_id=project_id,
        )

        view_query["pageSize"] = "wrong"

        res = req_post(
            client, header_admin, dataset_admin_view_suffix, view_query
        )

        assert "'wrong' is not of type 'integer'" in res["message"]

    def test_dataset_admin_view_filter_by_dataset_id(
        self,
        client,
        header_admin,
        header,
        project_fields,
        dataset_fields,
    ):

        project_id = str(uuid.uuid4())
        dataset_id = str(uuid.uuid4())

        add_dataset(
            client,
            header_admin,
            header,
            project_fields,
            dataset_fields,
            dataset_id=dataset_id,
            project_id=project_id,
        )

        res = filter_view(
            client,
            header_admin,
            dataset_admin_view_suffix,
            [{"id": "dataset_id", "value": dataset_id}],
        )

        response = json.loads(res.data.decode("utf8"))
        assert response["_meta"]["total_items"] > 0

    def test_dataset_admin_view_filter_by_project_id(
        self,
        client,
        header_admin,
        header,
        project_fields,
        dataset_fields,
    ):

        project_id = str(uuid.uuid4())
        dataset_id = str(uuid.uuid4())

        add_dataset(
            client,
            header_admin,
            header,
            project_fields,
            dataset_fields,
            dataset_id=dataset_id,
            project_id=project_id,
        )

        res = filter_view(
            client,
            header_admin,
            dataset_admin_view_suffix,
            [{"id": "project_id", "value": project_id}],
        )

        response = json.loads(res.data.decode("utf8"))
        assert response["_meta"]["total_items"] == 1

    # def test_dataset_admin_filtering_by_the_selected_field_not_allowed(
    #     self,
    #     client,
    #     header_admin,
    #     header,
    #     project_fields,
    #     dataset_fields,
    # ):

    #     project_id = str(uuid.uuid4())
    #     dataset_id = str(uuid.uuid4())

    #     add_dataset(
    #         client,
    #         header_admin,
    #         header,
    #         project_fields,
    #         dataset_fields,
    #         dataset_id=dataset_id,
    #         project_id=project_id,
    #     )

    #     res = filter_view(
    #         client,
    #         header_admin,
    #         dataset_admin_view_suffix,
    #         [{"id": "dataset_id", "value": "1"}],
    #     )

    #     response = json.loads(res.data.decode("utf8"))
    #     assert "the selected field cannot be used for filtering" == (
    #         response["message"]
    #     )


class TestDatasetAdminMode:
    def test_datasets_admin_get_cols(self, client, header_admin):

        # TODO
        # figure out why that is a post request
        res = req_post(client, header_admin, "datasets/adminviewcols", {})
        response = json.loads(res.data.decode("utf8"))

        assert "headers" in response[0]
        assert 26 == len(response[0]["headers"])

    def test_datasets_admin_get_cols_not_admin(self, client, header):

        # TODO
        # figure out why that is a post request
        res = req_post(client, header, "datasets/adminviewcols", {})
        response = json.loads(res.data.decode("utf8"))

        assert "endpoint only for admins" == response["message"]

    def test_dataset_admin_mode_user_not_admin(
        self, client, header, view_query
    ):

        res = req_post(client, header, dataset_admin_mode_suffix, view_query)

        response = json.loads(res.data.decode("utf8"))
        assert response["message"] == "Only admin users can update a dataset"

    def test_dataset_admin_mode_dataset_not_found(self, client, header_admin):

        res = req_post(
            client,
            header_admin,
            dataset_admin_mode_suffix,
            {"dbRowIds": [100], "field": "tags", "value": "test"},
        )

        response = json.loads(res.data.decode("utf8"))
        assert response["message"] == "dataset not found"

    def test_dataset_admin_mode_wrong_schema_count_col_is_not_int(
        self, client, header_admin
    ):

        err = "Samples or Features Count must be numeric"

        response = req_post(
            client,
            header_admin,
            dataset_admin_mode_suffix,
            {"dbRowIds": [100], "field": "samplesCount", "value": "test"},
        )
        assert response["message"] == err

    def test_dataset_admin_mode_wrong_schema_controls_included_wrong_enums(
        self, client, header_admin
    ):

        response = req_post(
            client,
            header_admin,
            dataset_admin_mode_suffix,
            {
                "dbRowIds": [100],
                "field": "healthyControllsIncluded",
                "value": "test",
            },
        )
        assert response["message"] == "'test' is not one of ['True', 'False']"

    def test_dataset_admin_mode_wrong_schema_visibility_wrong_enums(
        self, client, header_admin
    ):

        response = req_post(
            client,
            header_admin,
            dataset_admin_mode_suffix,
            {"dbRowIds": [100], "field": "visibility", "value": "public"},
        )
        assert response["message"] == (
            "'public' is not one of ['private', 'visible to all']"
        )

    def test_dataset_admin_mode_update_name(
        self, client, header, header_admin, project_fields, dataset_fields
    ):

        modify_ds_data(
            client,
            header,
            header_admin,
            project_fields,
            dataset_fields,
            "name",
            "name_changed",
        )

    def test_dataset_admin_mode_update_tags(
        self, client, header, header_admin, project_fields, dataset_fields
    ):

        modify_ds_data(
            client,
            header,
            header_admin,
            project_fields,
            dataset_fields,
            "tags",
            "tag_changed",
        )

    def test_dataset_admin_update_disease(
        self, client, header, header_admin, project_fields, dataset_fields
    ):

        modify_ds_data(
            client,
            header,
            header_admin,
            project_fields,
            dataset_fields,
            "disease",
            "COPD",
        )

    def test_dataset_admin_update_disease_new_val_not_allowed_for_that_project(
        self, client, header, header_admin, project_fields, dataset_fields
    ):

        modify_ds_data(
            client,
            header,
            header_admin,
            project_fields,
            dataset_fields,
            "disease",
            "Cancer",
            expected_error="Cancer not allowed for the project",
        )

    def test_dataset_admin_update_visibility_to_private(
        self, client, header, header_admin, project_fields, dataset_fields
    ):

        modify_ds_data(
            client,
            header,
            header_admin,
            project_fields,
            dataset_fields,
            "visibility",
            "private",
        )

    def test_dataset_admin_update_visibility_to_visible_to_all(
        self, client, header, header_admin, project_fields, dataset_fields
    ):

        modify_ds_data(
            client,
            header,
            header_admin,
            project_fields,
            dataset_fields,
            "visibility",
            "visible to all",
        )

    def test_dataset_admin_update_visibility_cannot_change_visibility(
        self, client, header, header_admin, project_fields, dataset_fields
    ):

        modify_ds_data(
            client,
            header,
            header_admin,
            project_fields,
            dataset_fields,
            "visibility",
            "visible to all",
            proj_overwrite_fields={"datasetVisibilityChangeable": False},
            expected_error="Cannot change the visibility",
        )
