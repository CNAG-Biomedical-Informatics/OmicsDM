import json
from uuid import uuid4

import re

import pytest
from tests.helpers.utils import start_file_upload

from utils import (
    req_get,
    req_post,
    req_put,
    upload_file,
    upload_file_complete,
    filter_view,
    add_dataset,
    sign_url,
    do_filtering,
)

file_signer_suffix = "/files?to_sign=POST"
# file_upload_suffixes = ["files/startupload", "files?arg=finishUpload"]
file_upload_suffixes = ["files/startupload", "files/finishupload"]

# TODO change this on the frontend as well
# file_view_url_suffix = "files?arg=view"
file_view_url_suffix = "files/all"
# file_download_suffix = "files?arg=download"
file_download_suffix = "files/download"

# file_disable_suffix = "files?arg=disableFiles"
file_disable_suffix = "files/disable"
file_admin_view_suffix = "files/admin/view"
file_admin_mode_suffix = "files/admin/update"

projects_create_url_suffix = "projects/create"

dataset_view_url_suffix = "datasets/all"
dataset_add_group_url_suffix = "datasets?arg=addGroup"
dataset_remove_group_url_suffix = "datasets?arg=removeGroup"

file_submission_cols_url_suffix = "files/submissioncols"

test_file_name = "testfile1.tsv"
test_aws_key = "3tr/test/testfile1.tsv_uploadedVersion_1.tsv"

msg_groups_updated = "groups updated"
msg_returned_urls = "returned presigned urls"

# TODO
# figure out why the filter by file_id
# was before str(file_id)

# ! might be that the frontend filtering is broken
# ! because the backend only seems to accept
# ! the file_id as an integer

# TODO
# replace json.loads with res.json["message"]


class TestFileUpload:
    def test_get_file_submission_cols(self, client, header_admin):

        res = req_get(client, header_admin, file_submission_cols_url_suffix)
        assert "message" in res.json[0]

        cols = res.json[0]["message"]
        assert len(cols) == 3

        assert [
            "description",
            "id",
            "inputType",
            "mandatory",
            "selection",
            "title",
        ] == list(cols[0].keys())

        assert cols[0]["id"] == "DatasetID"
        assert type(cols[0]["mandatory"]) == bool
        assert type(cols[0]["selection"]) == list

    @pytest.mark.smoke
    def test_files_sign_url_for_upload(
        self, client, header, header_admin, project_fields, dataset_fields
    ):

        sign_url(
            client,
            header_admin,
            header,
            project_fields,
            dataset_fields,
            file_signer_suffix,
            test_file_name,
        )

    def test_files_sign_url_for_upload_invalid_group(
        self, client, header_5, header_admin, project_fields, dataset_fields
    ):

        sign_url(
            client,
            header_admin,
            header_5,
            project_fields,
            dataset_fields,
            file_signer_suffix,
            test_file_name,
            kc_group="3tr",
            create_dataset=False,
            expected_error="invalid group",
        )

    def test_files_sign_url_for_upload_invalid_bucket(
        self, client, header, header_admin, project_fields, dataset_fields
    ):

        sign_url(
            client,
            header_admin,
            header,
            project_fields,
            dataset_fields,
            file_signer_suffix,
            test_file_name,
            bucket="bucketdevel",
            expected_error="invalid bucket",
        )

    def test_files_sign_url_for_upload_invalid_dataset_not_exist(
        self, client, header, header_admin, project_fields, dataset_fields
    ):

        dataset_id = str(uuid4())

        add_dataset(
            client,
            header_admin,
            header,
            project_fields,
            dataset_fields,
            dataset_id=dataset_id,
        )

        sign_url(
            client,
            header_admin,
            header,
            project_fields,
            dataset_fields,
            file_signer_suffix,
            test_file_name,
            create_dataset=False,
            expected_error="invalid dataset",
        )

    def test_files_sign_url_for_upload_invalid_dataset_owner(
        self, client, header_4, header_admin, project_fields, dataset_fields
    ):

        sign_url(
            client,
            header_admin,
            header_4,
            project_fields,
            dataset_fields,
            file_signer_suffix,
            test_file_name,
            kc_group="3tr",
            expected_error="invalid data owner",
        )

    def test_files_sign_url_for_upload_file_already_exists(
        self, client, header_admin, header, dataset_fields, project_fields
    ):
        project_id = str(uuid4())
        dataset_id = str(uuid4())

        upload_file_complete(
            client,
            header_admin,
            header,
            project_id,
            dataset_id,
            project_fields,
            dataset_fields,
            test_file_name,
            dataset_private=True,
        )

        sign_url(
            client,
            header_admin,
            header,
            project_fields,
            dataset_fields,
            file_signer_suffix,
            test_file_name,
            dataset_id=dataset_id,
            create_dataset=False,
            expected_error="file already exists",
        )

    @pytest.mark.smoke
    def test_files_init_upload(
        self, client, header_admin, header, dataset_fields, project_fields
    ):

        dataset_id = str(uuid4())
        project_id = str(uuid4())

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
            client,
            header,
            file_upload_suffixes[0],
            {
                "projectId": project_id,
                "DatasetID": dataset_id,
                "Comment": "",
                "fileName": test_file_name,
            },
        )

        assert res.status_code == 200
        response = json.loads(res.data.decode("utf8"))

        assert dataset_id in response["awsKey"]
        assert "File metadata inserted in database" in response["message"]

    def test_files_init_block_malicious_intent(
        self, client, header_5, header_admin, project_fields, dataset_fields
    ):

        # scenario:
        # kc group not found
        # group is only none if the user's keycloak group
        # has never interacted with the server before
        # and this is not possible since the user has to create
        # a dataset first

        start_file_upload(
            client,
            header_admin,
            header_5,
            project_fields,
            dataset_fields,
            file_upload_suffixes[0],
            test_file_name,
            expected_error="user not authorized",
            create_dataset=False,
        )

    def test_files_init_upload_dataset_not_exist(
        self, client, header_admin, header, project_fields, dataset_fields
    ):
        # create a dummy dataset
        # to make sure that the group is created
        add_dataset(
            client,
            header_admin,
            header,
            project_fields,
            dataset_fields,
        )

        start_file_upload(
            client,
            header_admin,
            header,
            project_fields,
            dataset_fields,
            file_upload_suffixes[0],
            test_file_name,
            expected_error="dataset does not exist",
            create_dataset=False,
        )

    # TODO
    def test_files_init_upload_required_field_is_missing(
        self,
        client,
        header,
        header_admin,
        project_fields,
        dataset_fields,
        file_fields,
    ):

        err = "At least one required field is empty/unselected"

        for field in file_fields:
            start_file_upload(
                client,
                header_admin,
                header,
                project_fields,
                dataset_fields,
                file_upload_suffixes[0],
                test_file_name,
                expected_error=err,
                field_to_be_deleted=field,
            )

    def test_files_init_field_cannot_be_empty(
        self,
        client,
        header,
        header_admin,
        project_fields,
        dataset_fields,
        file_fields,
    ):
        expected_err = "At least one required field is empty/unselected"

        for field in file_fields:

            if field == "Comment":
                continue

            start_file_upload(
                client,
                header_admin,
                header,
                project_fields,
                dataset_fields,
                file_upload_suffixes[0],
                test_file_name,
                expected_error=expected_err,
                overwrite_fields={field: ""},
            )

    def test_files_upload_filename_w_spaces(
        self, client, header, header_admin, project_fields, dataset_fields
    ):

        file_name = "testfile 1.tsv"

        start_file_upload(
            client,
            header_admin,
            header,
            project_fields,
            dataset_fields,
            file_upload_suffixes[0],
            file_name,
            expected_error=(f"file {file_name} contains spaces"),
        )

    def test_files_upload_bad_file_extension(
        self, client, header, header_admin, project_fields, dataset_fields
    ):

        file_name = "testfile1.php"

        start_file_upload(
            client,
            header_admin,
            header,
            project_fields,
            dataset_fields,
            file_upload_suffixes[0],
            file_name,
            expected_error=("forbidden file extension"),
        )

    @pytest.mark.smoke
    def test_files_finish_upload(
        self, client, header_admin, header, project_fields, dataset_fields
    ):

        dataset_id = str(uuid4())
        project_id = str(uuid4())

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
            client,
            header,
            file_upload_suffixes[0],
            {
                "projectId": project_id,
                "DatasetID": dataset_id,
                "Comment": "",
                "fileName": test_file_name,
            },
        )

        assert res.status_code == 200
        response = json.loads(res.data.decode("utf8"))

        assert dataset_id in response["awsKey"]
        assert "File metadata inserted in database" in response["message"]

        res = req_post(
            client,
            header,
            file_upload_suffixes[1],
            {"aws_key": response["awsKey"]},
        )

        assert res.status_code == 200
        response = json.loads(res.data.decode("utf8"))
        assert "File upload finished" in response["message"]

    def test_files_finish_upload_wrong_group(
        self, client, header_2, view_query
    ):

        # dummy query to add the user's group to the db
        req_post(client, header_2, file_view_url_suffix, view_query)

        res = req_post(
            client,
            header_2,
            file_upload_suffixes[1],
            {"aws_key": test_aws_key},
        )

        assert res.status_code == 405
        response = json.loads(res.data.decode("utf8"))
        assert "group name does not match" in response["message"]

    def test_files_finish_upload_group_not_exist(self, client, header_5):

        aws_key = "group5/test/testfile1.tsv_uploadedVersion_1.tsv"

        res = req_post(
            client,
            header_5,
            file_upload_suffixes[1],
            {"aws_key": aws_key},
        )

        assert res.status_code == 405
        response = json.loads(res.data.decode("utf8"))
        assert "user not authorized" in response["message"]

    def test_files_finish_upload_dataset_not_exist(
        self, client, header, view_query
    ):

        # file view query to prevent that group is none
        res = req_post(client, header, file_view_url_suffix, view_query)

        response = json.loads(res.data.decode("utf8"))
        assert "items" in response

        res2 = req_post(
            client,
            header,
            file_upload_suffixes[1],
            {"aws_key": "3tr/test99/testfile1.tsv_uploadedVersion_1.tsv"},
        )

        assert res2.status_code == 404
        response2 = json.loads(res2.data.decode("utf8"))
        assert "dataset does not exist" in response2["message"]

    def test_files_finish_upload_file_not_exist(
        self, client, header, header_admin, project_fields, dataset_fields
    ):

        dataset_id = str(uuid4())

        add_dataset(
            client,
            header_admin,
            header,
            project_fields,
            dataset_fields,
            dataset_id=dataset_id,
        )

        key = f"3tr/{dataset_id}/testfile99.tsv_uploadedVersion_1.tsv"

        res2 = req_post(
            client, header, file_upload_suffixes[1], {"aws_key": key}
        )

        assert res2.status_code == 404
        response2 = json.loads(res2.data.decode("utf8"))
        assert "file does not exist" in response2["message"]


class TestFileView:
    def test_file_get_cols(self, client, header_admin):

        res = req_get(client, header_admin, "files/viewcols")
        response = json.loads(res.data.decode("utf8"))

        assert "headers" in response[0]
        assert 10 == len(response[0]["headers"])

    def test_files_view_unfinished_uploads(
        self, client, header_admin, header, project_fields, dataset_fields
    ):

        # scenario:
        # make sure only the files successfully uploaded (file.enabled = True)
        # are used when showing the files in the view

        # upload unfinished because only the endpoint startUpload is called
        dataset_id = str(uuid4())
        project_id = str(uuid4())

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
            client,
            header,
            file_upload_suffixes[0],
            {
                "projectId": project_id,
                "DatasetID": dataset_id,
                "Comment": "",
                "fileName": "unfinished.tsv",
            },
        )

        assert res.status_code == 200
        response = json.loads(res.data.decode("utf8"))
        assert (
            f"3tr/{dataset_id}/unfinished.tsv_uploadedVersion_1.tsv"
            in response["awsKey"]
        )
        assert "File metadata inserted in database" in response["message"]

        res = filter_view(
            client,
            header,
            file_view_url_suffix,
            [{"id": "dataset_id", "value": dataset_id}],
        )

        response = json.loads(res.data.decode("utf8"))

        assert "items" in response
        assert len(response["items"]) == 0

    def test_files_view(
        self, client, header_admin, header, project_fields, dataset_fields
    ):

        project_id = str(uuid4())
        dataset_id = str(uuid4())

        upload_file_complete(
            client,
            header_admin,
            header,
            project_id,
            dataset_id,
            project_fields,
            dataset_fields,
            test_file_name,
            dataset_private=True,
        )

        res = filter_view(
            client,
            header,
            file_view_url_suffix,
            [{"id": "dataset_id", "value": dataset_id}],
        )

        response = json.loads(res.data.decode("utf8"))

        assert "items" in response
        assert len(response["items"]) == 1
        # number of file table fields

        # ! before the assert was 12
        assert 12 == len(response["items"][0])
        # but only 11 fields are returned in the response
        # no idea which are missing right now

        assert "test" == response["items"][0]["comment"]

    def test_files_version_increased(
        self, client, header_admin, header, dataset_fields, project_fields
    ):

        # TODO
        # make sure only the files successfully uploaded
        # (file.enabled = True)
        # are used when determining the new version of the file

        dataset_id = str(uuid4())
        project_id = str(uuid4())

        file_id = upload_file_complete(
            client,
            header_admin,
            header,
            project_id,
            dataset_id,
            project_fields,
            dataset_fields,
            test_file_name,
            dataset_private=True,
        )[0]

        # initital file view
        res = filter_view(
            client,
            header,
            file_view_url_suffix,
            [{"id": "id", "value": str(file_id)}],
        )
        response = json.loads(res.data.decode("utf8"))
        assert file_id == response["items"][0]["id"]
        assert 1 == response["items"][0]["version"]

        # upload the same file again
        res = upload_file(
            client,
            header,
            project_id,
            dataset_id,
            file_upload_suffixes,
            test_file_name,
        )
        response = json.loads(res.data.decode("utf8"))
        assert "File upload finished" in response["message"]

        # file view
        res2 = filter_view(
            client,
            header,
            file_view_url_suffix,
            [{"id": "dataset_id", "value": dataset_id}],
        )
        response2 = json.loads(res2.data.decode("utf8"))
        assert 1 == response2["items"][0]["version"]
        assert 2 == response2["items"][1]["version"]

    def test_files_filter_by_dataset_id(
        self, client, header_admin, header, dataset_fields, project_fields
    ):

        dataset_id = str(uuid4())
        project_id = str(uuid4())

        args = {
            "client": client,
            "header_admin": header_admin,
            "header": header,
            "project_fields": project_fields,
            "dataset_fields": dataset_fields,
            "dataset_id": dataset_id,
            "project_id": project_id,
            "file_name": test_file_name,
        }

        query = {"col": "dataset_id", "val": dataset_id}

        do_filtering(args, "file", query)

    def test_files_filter_by_project_id(
        self, client, header_admin, header, dataset_fields, project_fields
    ):
        dataset_id = str(uuid4())
        project_id = str(uuid4())

        args = {
            "client": client,
            "header_admin": header_admin,
            "header": header,
            "project_fields": project_fields,
            "dataset_fields": dataset_fields,
            "dataset_id": dataset_id,
            "project_id": project_id,
            "file_name": test_file_name,
        }

        query = {"col": "project_id", "val": project_id}

        do_filtering(args, "file", query)

    def test_files_filter_by_not_existing_project_id(
        self, client, header_admin, header, dataset_fields, project_fields
    ):
        dataset_id = str(uuid4())
        project_id = str(uuid4())

        args = {
            "client": client,
            "header_admin": header_admin,
            "header": header,
            "project_fields": project_fields,
            "dataset_fields": dataset_fields,
            "dataset_id": dataset_id,
            "project_id": project_id,
            "file_name": test_file_name,
        }

        query = {"col": "project_id", "val": "not_existing_project_id"}

        do_filtering(args, "file", query, expected_count=0)

    def test_files_filter_by_dataset_id_and_file_version(
        self, client, header_admin, header, project_fields, dataset_fields
    ):

        dataset_id = str(uuid4())
        project_id = str(uuid4())

        file_id = upload_file_complete(
            client,
            header_admin,
            header,
            project_id,
            dataset_id,
            project_fields,
            dataset_fields,
            test_file_name,
            dataset_private=True,
        )[0]

        # initital file view
        res = filter_view(
            client,
            header,
            file_view_url_suffix,
            [{"id": "id", "value": str(file_id)}],
        )
        response = json.loads(res.data.decode("utf8"))
        assert file_id == response["items"][0]["id"]
        assert 1 == response["items"][0]["version"]

        # upload the same file again
        res = upload_file(
            client,
            header,
            project_id,
            dataset_id,
            file_upload_suffixes,
            test_file_name,
        )
        response = json.loads(res.data.decode("utf8"))
        assert "File upload finished" in response["message"]

        # file view
        res2 = filter_view(
            client,
            header,
            file_view_url_suffix,
            [{"id": "dataset_id", "value": dataset_id}],
        )
        response2 = json.loads(res2.data.decode("utf8"))
        assert 2 == len(response2["items"])

        # file view
        res3 = filter_view(
            client,
            header,
            file_view_url_suffix,
            [
                {"id": "dataset_id", "value": dataset_id},
                {"id": "version", "value": "1"},
            ],
        )
        response3 = json.loads(res3.data.decode("utf8"))
        assert 1 == len(response3["items"])
        assert 1 == response3["items"][0]["version"]

    def test_file_sort_by_dataset_id(self, client, header, view_query):

        col = "dataset_id"
        query = view_query

        responses = []
        for desc_bool in [True, False]:
            query["sorted"] = [{"id": col, "desc": desc_bool}]

            res = req_post(
                client,
                header,
                file_view_url_suffix,
                query,
            )
            responses.append(json.loads(res.data.decode("utf8")))

        # get all dataset ids
        dataset_ids_desc = []
        dataset_ids_asc = []

        i = 0
        for response in responses:
            for entry in response["items"]:
                if i == 0:
                    dataset_ids_desc.append(entry["dataset_id"])
                else:
                    dataset_ids_asc.append(entry["dataset_id"])
            i += 1

        # make sure that the reverse of one list is the same as the other
        assert dataset_ids_desc == dataset_ids_asc[::-1]


class TestFileShare:
    def test_dataset_share_with_one_group(
        self,
        client,
        header_admin,
        header,
        header_2,
        dataset_fields,
        project_fields,
    ):

        test = ["cnag"]

        dataset_id = str(uuid4())
        project_id = str(uuid4())

        file_id = upload_file_complete(
            client,
            header_admin,
            header,
            project_id,
            dataset_id,
            project_fields,
            dataset_fields,
            test_file_name,
            dataset_private=True,
        )[0]

        # group 2 file view before sharing
        res = filter_view(
            client,
            header_2,
            file_view_url_suffix,
            [{"id": "id", "value": str(file_id)}],
        )
        response = json.loads(res.data.decode("utf8"))
        assert 0 == response["_meta"]["total_items"]

        # share dataset with group 2
        res2 = req_put(
            client,
            header,
            dataset_add_group_url_suffix,
            [
                f"project={project_id}",
                f"dataset={dataset_id}",
                f"group={test[0]}",
            ],
        )
        response2 = json.loads(res2.data.decode("utf8"))
        assert msg_groups_updated in response2["message"]

        # group 2 file after sharing
        res3 = filter_view(
            client,
            header_2,
            file_view_url_suffix,
            [{"id": "id", "value": str(file_id)}],
        )
        response3 = json.loads(res3.data.decode("utf8"))
        assert file_id == response3["items"][0]["id"]

    @pytest.mark.parametrize("tester", [True], indirect=["tester"])
    def test_dataset_unshare_with_one_group(
        self,
        client,
        header_admin,
        header,
        view_query,
        tester,
        dataset_fields,
        project_fields,
    ):

        test = ["cnag"]

        project_id = str(uuid4())
        dataset_id = str(uuid4())

        file_id = upload_file_complete(
            client,
            header_admin,
            header,
            project_id,
            dataset_id,
            project_fields,
            dataset_fields,
            test_file_name,
            dataset_private=True,
        )[0]

        # then share the dataset it with one group
        res = req_put(
            client,
            header,
            dataset_add_group_url_suffix,
            [
                f"project={project_id}",
                f"dataset={dataset_id}",
                f"group={test[0]}",
            ],
        )
        response = json.loads(res.data.decode("utf8"))
        assert msg_groups_updated in response["message"]

        # group 1 file view
        res2 = filter_view(
            client,
            header,
            file_view_url_suffix,
            [{"id": "id", "value": str(file_id)}],
        )
        response = json.loads(res2.data.decode("utf8"))
        assert file_id == response["items"][0]["id"]
        assert "cnag" == response["items"][0]["shared_with"]

        tester.dothis(
            client, header, project_id, dataset_id, "cnag", view_query
        )

    def test_dataset_share_with_all_groups(
        self, client, header_admin, header, dataset_fields, project_fields
    ):
        # "file.shared_with" column should be updated as well

        test = ["ALL"]

        dataset_id = str(uuid4())
        project_id = str(uuid4())

        file_id = upload_file_complete(
            client,
            header_admin,
            header,
            project_id,
            dataset_id,
            project_fields,
            dataset_fields,
            test_file_name,
            dataset_private=True,
        )[0]

        # initial file view
        res = filter_view(
            client,
            header,
            file_view_url_suffix,
            [{"id": "id", "value": str(file_id)}],
        )
        response = json.loads(res.data.decode("utf8"))
        assert 1 == response["_meta"]["total_items"]
        assert dataset_id == response["items"][0]["dataset_id"]
        assert "3tr" == response["items"][0]["owner"]
        assert "None" == response["items"][0]["shared_with"]

        # share dataset with all groups
        res2 = req_put(
            client,
            header,
            dataset_add_group_url_suffix,
            [
                f"project={project_id}",
                f"dataset={dataset_id}",
                f"group={test[0]}",
            ],
        )
        response2 = json.loads(res2.data.decode("utf8"))
        assert msg_groups_updated in response2["message"]

        # verify file view
        res3 = filter_view(
            client,
            header,
            file_view_url_suffix,
            [{"id": "dataset_id", "value": dataset_id}],
        )
        response3 = json.loads(res3.data.decode("utf8"))
        assert 1 == response3["_meta"]["total_items"]
        assert dataset_id == response3["items"][0]["dataset_id"]
        assert "3tr" == response3["items"][0]["owner"]
        assert "ALL GROUPS" == response3["items"][0]["shared_with"]

    @pytest.mark.parametrize("tester", [True], indirect=["tester"])
    def test_dataset_unshare_with_all_groups(
        self,
        client,
        header_admin,
        header,
        view_query,
        tester,
        dataset_fields,
        project_fields,
    ):

        test = ["ALL"]

        dataset_id = str(uuid4())
        project_id = str(uuid4())

        file_id = upload_file_complete(
            client,
            header_admin,
            header,
            project_id,
            dataset_id,
            project_fields,
            dataset_fields,
            test_file_name,
            dataset_private=True,
        )[0]

        # then share the dataset it with all groups
        res = req_put(
            client,
            header,
            dataset_add_group_url_suffix,
            [
                f"project={project_id}",
                f"dataset={dataset_id}",
                f"group={test[0]}",
            ],
        )
        response = json.loads(res.data.decode("utf8"))
        assert msg_groups_updated in response["message"]

        # group 1 file view
        res2 = filter_view(
            client,
            header,
            file_view_url_suffix,
            [{"id": "id", "value": str(file_id)}],
        )
        response = json.loads(res2.data.decode("utf8"))
        assert file_id == response["items"][0]["id"]
        assert "ALL GROUPS" == response["items"][0]["shared_with"]

        tester.dothis(
            client, header, project_id, dataset_id, "ALL", view_query
        )


class TestFileDownload:
    @pytest.mark.smoke
    def test_files_generate_download_url_ds_owner(
        self,
        client,
        header,
        header_admin,
        dataset_fields,
        project_fields,
    ):

        project_id = str(uuid4())
        ds_id = str(uuid4())
        bucket = "bucketdevel3tropal"

        file_ids = []

        i = 1
        for create in [True, False]:
            file_id = upload_file_complete(
                client,
                header_admin,
                header,
                project_id,
                ds_id,
                project_fields,
                dataset_fields,
                f"testfile{i}.tsv",
                create_dataset=create,
            )[0]

            file_ids.append(file_id)
            i += 1

        res = req_post(
            client,
            header,
            file_download_suffix,
            {"file_ids": file_ids},
        )

        assert res.status_code == 200
        response = json.loads(res.data.decode("utf8"))
        assert msg_returned_urls in response["message"]
        assert len(response["presignedUrls"]) == 2

        fname = "testfile1.tsv_uploadedVersion_1.tsv"
        regex_str = f"^https?.//.*/{bucket}/.*/{ds_id}/{fname}+[?]+X-Amz"
        url_regex = re.compile(regex_str)
        assert url_regex.match(response["presignedUrls"][str(file_ids[0])])

    def test_files_generate_download_url_ds_wrong_group(
        self,
        client,
        header_admin,
        header,
        header_2,
        dataset_fields,
        project_fields,
    ):

        project_id = str(uuid4())
        dataset_id = str(uuid4())

        file_id = upload_file_complete(
            client,
            header_admin,
            header,
            project_id,
            dataset_id,
            project_fields,
            dataset_fields,
            test_file_name,
            dataset_private=True,
        )[0]

        # group 1 file view
        res = filter_view(
            client,
            header,
            file_view_url_suffix,
            [{"id": "id", "value": str(file_id)}],
        )
        response = json.loads(res.data.decode("utf8"))
        assert file_id == response["items"][0]["id"]

        # group2 file view
        res = filter_view(
            client,
            header_2,
            file_view_url_suffix,
            [{"id": "id", "value": str(file_id)}],
        )
        response = json.loads(res.data.decode("utf8"))
        assert 0 == response["_meta"]["total_items"]

        res2 = req_post(
            client,
            header_2,
            file_download_suffix,
            {"file_ids": [str(file_id)]},
        )

        assert res2.status_code == 404
        response2 = json.loads(res2.data.decode("utf8"))
        assert "file not found" in response2["message"]

    def test_files_generate_download_url_ds_shared_w_one_group(
        self,
        client,
        header_admin,
        header,
        header_2,
        dataset_fields,
        project_fields,
    ):
        test = ["cnag"]

        dataset_id = str(uuid4())
        project_id = str(uuid4())

        file_id = upload_file_complete(
            client,
            header_admin,
            header,
            project_id,
            dataset_id,
            project_fields,
            dataset_fields,
            test_file_name,
            dataset_private=True,
        )[0]

        # group 2 file view before sharing
        res = filter_view(
            client,
            header_2,
            file_view_url_suffix,
            [{"id": "id", "value": str(file_id)}],
        )
        response = json.loads(res.data.decode("utf8"))
        assert 0 == response["_meta"]["total_items"]

        # share dataset with group 2
        res2 = req_put(
            client,
            header,
            dataset_add_group_url_suffix,
            [
                f"project={project_id}",
                f"dataset={dataset_id}",
                f"group={test[0]}",
            ],
        )
        response2 = json.loads(res2.data.decode("utf8"))
        assert msg_groups_updated in response2["message"]

        # group 2 file after sharing
        res3 = filter_view(
            client,
            header_2,
            file_view_url_suffix,
            [{"id": "id", "value": str(file_id)}],
        )
        response3 = json.loads(res3.data.decode("utf8"))
        assert file_id == response3["items"][0]["id"]

        res4 = req_post(
            client,
            header_2,
            file_download_suffix,
            {"file_ids": [str(file_id)]},
        )

        assert res4.status_code == 200
        response4 = json.loads(res4.data.decode("utf8"))
        assert msg_returned_urls in response4["message"]
        assert "download forbidden" != response4["presignedUrls"][str(file_id)]

    @pytest.mark.smoke
    def test_files_generate_download_url_ds_shared_w_all(
        self,
        client,
        header_admin,
        header,
        dataset_fields,
        project_fields,
    ):
        project_id = str(uuid4())
        dataset_id = str(uuid4())

        file_id = upload_file_complete(
            client,
            header_admin,
            header,
            project_id,
            dataset_id,
            project_fields,
            dataset_fields,
            test_file_name,
            dataset_private=True,
        )[0]

        res2 = req_post(
            client, header, file_download_suffix, {"file_ids": [file_id]}
        )

        assert res2.status_code == 200
        response2 = json.loads(res2.data.decode("utf8"))
        assert msg_returned_urls in response2["message"]
        assert "download forbidden" != response2["presignedUrls"][str(file_id)]

    def test_file_download_block_malicious_intent(
        self,
        client,
        header_admin,
        header,
        header_5,
        dataset_fields,
        project_fields,
    ):

        project_id = str(uuid4())
        dataset_id = str(uuid4())

        file_id = upload_file_complete(
            client,
            header_admin,
            header,
            project_id,
            dataset_id,
            project_fields,
            dataset_fields,
            test_file_name,
            dataset_private=True,
        )[0]

        # filter view
        res = filter_view(
            client,
            header,
            file_view_url_suffix,
            [{"id": "id", "value": str(file_id)}],
        )
        response = json.loads(res.data.decode("utf8"))
        assert response["_meta"]["total_items"] == 1

        file_id = response["items"][0]["id"]
        assert isinstance(file_id, int)

        file_ids = [str(file_id)]

        # try to download the file with a user
        # that never has interacted with the server before
        res = req_post(
            client,
            header_5,
            file_download_suffix,
            {"file_ids": file_ids},
        )

        response = json.loads(res.data.decode("utf8"))
        assert "user not authorized" in response["message"]

    def test_file_dl_not_allowed(
        self,
        client,
        header_admin,
        header,
        header_2,
        dataset_fields,
        project_fields,
    ):

        project_id = str(uuid4())
        dataset_id = str(uuid4())

        file_id = upload_file_complete(
            client,
            header_admin,
            header,
            project_id,
            dataset_id,
            project_fields,
            dataset_fields,
            test_file_name,
            dataset_private=False,
            file_dl_allowed=False,
        )[0]

        # filter view
        res = filter_view(
            client,
            header_2,
            file_view_url_suffix,
            [{"id": "id", "value": str(file_id)}],
        )
        response = json.loads(res.data.decode("utf8"))
        assert response["_meta"]["total_items"] == 1

        file_id = response["items"][0]["id"]
        assert isinstance(file_id, int)

        file_ids = [str(file_id)]

        # try to download the file with a user
        # which should not be allowed to download the file
        res = req_post(
            client,
            header_2,
            file_download_suffix,
            {"file_ids": file_ids},
        )

        response = json.loads(res.data.decode("utf8"))

        assert "returned presigned urls" in response["message"]
        assert "download forbidden" == response["presignedUrls"][str(file_id)]

    def test_file_dl_allowed_false_but_user_in_group(
        self,
        client,
        header_admin,
        header,
        dataset_fields,
        project_fields,
    ):
        # scenario: on the project level the download is not allowed
        # but the user is in the project owner group
        # so the download should be allowed

        project_id = str(uuid4())
        dataset_id = str(uuid4())

        file_id = upload_file_complete(
            client,
            header_admin,
            header,
            project_id,
            dataset_id,
            project_fields,
            dataset_fields,
            test_file_name,
            dataset_private=False,
            file_dl_allowed=False,
        )[0]

        # filter view
        res = filter_view(
            client,
            header,
            file_view_url_suffix,
            [{"id": "id", "value": str(file_id)}],
        )
        response = json.loads(res.data.decode("utf8"))
        assert response["_meta"]["total_items"] == 1

        file_id = response["items"][0]["id"]
        assert isinstance(file_id, int)

        file_ids = [str(file_id)]

        # try to download the file
        res = req_post(
            client,
            header,
            file_download_suffix,
            {"file_ids": file_ids},
        )

        response = json.loads(res.data.decode("utf8"))

        assert "returned presigned urls" in response["message"]
        assert "download forbidden" != response["presignedUrls"][str(file_id)]


class TestFileDisable:
    def test_file_disable_files(
        self, client, header_admin, header, dataset_fields, project_fields
    ):

        # !FIXME
        # works only if executed alone

        project_id = str(uuid4())
        dataset_id = str(uuid4())

        file_id = upload_file_complete(
            client,
            header_admin,
            header,
            project_id,
            dataset_id,
            project_fields,
            dataset_fields,
            test_file_name,
            dataset_private=True,
        )[0]

        # filter view
        res = filter_view(
            client,
            header,
            file_view_url_suffix,
            [
                {"id": "id", "value": str(file_id)},
            ],
        )
        response = json.loads(res.data.decode("utf8"))
        assert response["_meta"]["total_items"] == 1

        file_id = response["items"][0]["id"]
        assert isinstance(file_id, int)

        file_ids = [str(file_id)]

        # disable a file
        query = {"fileIds": file_ids}
        res2 = req_post(
            client,
            header,
            file_disable_suffix,
            query,
        )
        response2 = json.loads(res2.data.decode("utf8"))
        assert "file(s) status changed" in response2["message"]

        res3 = filter_view(
            client,
            header,
            file_view_url_suffix,
            [{"id": "dataset_id", "value": dataset_id}],
        )
        response3 = json.loads(res3.data.decode("utf8"))
        assert response3["_meta"]["total_items"] == 0

    def test_file_disable_file_wrong_schema(
        self, client, header_admin, header, dataset_fields, project_fields
    ):
        # !FIXME
        # works only if executed alone

        project_id = str(uuid4())
        dataset_id = str(uuid4())

        file_id = upload_file_complete(
            client,
            header_admin,
            header,
            project_id,
            dataset_id,
            project_fields,
            dataset_fields,
            test_file_name,
            dataset_private=True,
        )[0]

        # filter view
        res = filter_view(
            client,
            header,
            file_view_url_suffix,
            [
                {"id": "id", "value": str(file_id)},
            ],
        )
        response = json.loads(res.data.decode("utf8"))
        assert response["_meta"]["total_items"] > 0

        file_id = response["items"][0]["id"]
        assert isinstance(file_id, int)

        file_ids = [str(file_id)]

        # disable a file
        query = {"file_ids": file_ids}
        res = req_post(
            client,
            header,
            file_disable_suffix,
            query,
        )
        assert (
            res["message"] == "At least one required field is empty/unselected"
        )

    def test_file_disable_file_user_is_not_owner_of_all_file_ids(
        self,
        client,
        header_admin,
        header,
        header_2,
        dataset_fields,
        project_fields,
    ):
        dataset_id = str(uuid4())

        file_ids = []
        for head, group in [(header, "3tr"), (header_2, "cnag")]:
            project_id = str(uuid4())

            file_id = upload_file_complete(
                client,
                header_admin,
                head,
                project_id,
                dataset_id,
                project_fields,
                dataset_fields,
                test_file_name,
                dataset_private=True,
                group=group,
            )[0]
            file_ids.append(file_id)

        # try to disable the files
        # although not all files are owned by the user
        query = {"fileIds": file_ids}
        res = req_post(
            client,
            header_2,
            file_disable_suffix,
            query,
        )
        assert (
            "at least one of the requested files was not found"
            in res["message"]
        )

        res = filter_view(
            client,
            header,
            file_view_url_suffix,
            [{"id": "dataset_id", "value": dataset_id}],
        )
        response = json.loads(res.data.decode("utf8"))
        assert response["_meta"]["total_items"] == 1

    def test_file_disable_file_block_malicious_intent(
        self,
        client,
        header_admin,
        header,
        header_5,
        dataset_fields,
        project_fields,
    ):

        # !FIXME
        # works only if executed alone

        project_id = str(uuid4())
        dataset_id = str(uuid4())

        file_id = upload_file_complete(
            client,
            header_admin,
            header,
            project_id,
            dataset_id,
            project_fields,
            dataset_fields,
            test_file_name,
            dataset_private=True,
        )[0]

        # filter view
        res = filter_view(
            client,
            header,
            file_view_url_suffix,
            [{"id": "id", "value": str(file_id)}],
        )
        response = json.loads(res.data.decode("utf8"))
        assert response["_meta"]["total_items"] == 1

        file_id = response["items"][0]["id"]
        assert isinstance(file_id, int)

        file_ids = [file_id]

        # try to disable the file with a user
        # that never has interacted with the server before
        query = {"fileIds": file_ids}
        res = req_post(
            client,
            header_5,
            file_disable_suffix,
            query,
        )
        response = json.loads(res.data.decode("utf8"))
        assert "user not authorized" in response["message"]

        res = filter_view(
            client,
            header,
            file_view_url_suffix,
            [{"id": "dataset_id", "value": dataset_id}],
        )
        response = json.loads(res.data.decode("utf8"))
        assert response["_meta"]["total_items"] == 1


class TestFileAdminView:
    def test_file_admin_view_user_not_admin(self, client, header):

        res = req_post(
            client, header, file_admin_view_suffix, [{"id": "id", "value": ""}]
        )

        response = json.loads(res.data.decode("utf8"))
        assert response["message"] == "Only admin users can view files"

    def test_file_admin_view(
        self,
        client,
        header_admin,
        header,
        project_fields,
        dataset_fields,
        view_query,
    ):

        # ! still crashing

        project_id = str(uuid4())
        dataset_id = str(uuid4())

        upload_file_complete(
            client,
            header_admin,
            header,
            project_id,
            dataset_id,
            project_fields,
            dataset_fields,
            test_file_name,
        )

        res = req_post(
            client, header_admin, file_admin_view_suffix, view_query
        )

        response = json.loads(res.data.decode("utf8"))
        assert response["_meta"]["total_items"] > 0

    def test_file_admin_view_filter_by_file_id(
        self, client, header_admin, header, project_fields, dataset_fields
    ):

        project_id = str(uuid4())
        dataset_id = str(uuid4())

        upload_file_complete(
            client,
            header_admin,
            header,
            project_id,
            dataset_id,
            project_fields,
            dataset_fields,
            test_file_name,
        )

        res = filter_view(
            client,
            header_admin,
            file_admin_view_suffix,
            [{"id": "id", "value": "1"}],
        )

        response = json.loads(res.data.decode("utf8"))
        assert response["_meta"]["total_items"] == 1

    # def test_file_admin_view_only_filtering_by_file_id_is_allowed(
    #     self, client, header_admin, header, project_fields, dataset_fields
    # ):

    #     project_id = str(uuid4())
    #     dataset_id = str(uuid4())

    #     upload_file_complete(
    #         client,
    #         header_admin,
    #         header,
    #         project_id,
    #         dataset_id,
    #         project_fields,
    #         dataset_fields,
    #         test_file_name,
    #     )

    #     res = filter_view(
    #         client,
    #         header_admin,
    #         file_admin_view_suffix,
    #         [{"id": "dataset_id", "value": 1}],
    #     )

    #     response = json.loads(res.data.decode("utf8"))
    #     err = "the selected field cannot be used for filtering"
    #     assert err == response["message"]


class TestFileAdminMode:
    def test_file_admin_get_cols(self, client, header_admin):

        # TODO
        # figure out why that is a post request
        res = req_post(client, header_admin, "files/adminviewcols", {})
        response = json.loads(res.data.decode("utf8"))

        assert "headers" in response[0]
        assert 10 == len(response[0]["headers"])

    def test_file_admin_mode_user_not_admin(self, client, header, view_query):

        res = req_post(client, header, file_admin_mode_suffix, view_query)

        response = json.loads(res.data.decode("utf8"))
        assert response["message"] == "Only admin users can update a file"

    def test_file_admin_mode(
        self, client, header_admin, header, project_fields, dataset_fields
    ):
        project_id = str(uuid4())
        dataset_id = str(uuid4())

        upload_file_complete(
            client,
            header_admin,
            header,
            project_id,
            dataset_id,
            project_fields,
            dataset_fields,
            test_file_name,
        )

        res = filter_view(
            client,
            header,
            file_view_url_suffix,
            [{"id": "id", "value": "1"}],
        )

        response = json.loads(res.data.decode("utf8"))
        assert response["items"][0]["comment"] == "test"

        res2 = req_post(
            client,
            header_admin,
            file_admin_mode_suffix,
            {"dbRowIds": [1], "field": "comment", "value": "changed"},
        )

        response2 = json.loads(res2.data.decode("utf8"))
        assert response2["message"] == "File(s) updated"

        res3 = filter_view(
            client,
            header,
            file_view_url_suffix,
            [{"id": "id", "value": "1"}],
        )

        response3 = json.loads(res3.data.decode("utf8"))
        assert response3["items"][0]["comment"] == "changed"

    def test_file_admin_mode_file_not_found(self, client, header_admin):

        # !FIXME
        # completely stopped working

        res = req_post(
            client,
            header_admin,
            file_admin_mode_suffix,
            {"dbRowIds": [100], "field": "comment", "value": "test"},
        )

        response = json.loads(res.data.decode("utf8"))
        assert response["message"] == "file not found"

    def test_file_admin_mode_wrong_schema_file_is_not_an_array(
        self, client, header_admin
    ):

        res = req_post(
            client,
            header_admin,
            file_admin_mode_suffix,
            {"dbRowIds": "1", "field": "comment", "value": "test"},
        )

        assert "'1' is not of type 'array'" == res["message"]

    def test_file_admin_mode_wrong_schema_field_not_allowed(
        self, client, header_admin
    ):

        res = req_post(
            client,
            header_admin,
            file_admin_mode_suffix,
            {"dbRowIds": [1], "field": "platform", "value": "test"},
        )

        assert "'platform' is not one of" in res["message"]
