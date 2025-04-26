from jsonschema import validate
from jsonschema.exceptions import ValidationError

from datetime import datetime

from server.utils.error_handler import (
    BadValue,
    KeyNotFound,
    WrongSchema,
)

from server.app import db
from server.model import File, Dataset, Groups, Group

# from pydantic import ValidationError as PydanticValidationError

# TODO
# add email validation
# https://github.com/JoshData/python-email-validator
# (for dataset - contact)


def validate_schema(data, schema):
    try:
        validate(instance=data, schema=schema)
    except ValidationError as err:
        raise WrongSchema(err.message)


# def validate_using_pydantic(data, model):
#     try:
#         model(**data)
#     except PydanticValidationError as err:
#         raise WrongSchema(err.message)


def validate_ids(request_data, column_name):

    ids = list(map(lambda x: x.get("id"), request_data))
    if "" in ids:
        raise BadValue("id", "an empty string")

    if None in ids:
        raise KeyNotFound("id")

    if column_name == "project_id":
        if len(ids) != len(set(ids)):
            raise WrongSchema(f"duplicated {column_name}s not allowed")


def validate_timestamps(date_time, time_format):

    try:
        datetime.strptime(date_time, time_format)
    except ValueError:
        raise BadValue("date_time", "wrong format")


def file_exists(row, group):
    """
    used in file.py
    used for cellxgene integration
    """

    dataset_id = row["dataset_id"]
    file_owner = row["dataset_owner"]
    file_name = row["file_name"]
    file_version = row["file_version"]

    file_owner_group = Group.find_by_name(file_owner)
    if file_owner_group is None:
        raise EmptyQuery("Group.find_by_name", f"group {file_owner} not exist")

    dataset = (
        db.session.query(Dataset)
        .join(Groups, Dataset.id == Groups.dataset_id)
        .filter(Groups.group_id == file_owner_group.id)
        .filter(Dataset.dataset_id == dataset_id)
        .one_or_none()
    )

    if dataset is None:
        raise EmptyQuery("Dataset.find_by_name", f"dataset {dataset_id} not exist")

    conditions = [
        Dataset.private.is_(False),
    ]

    # TODO
    # below might have to be re implemented
    # see the
    if group is not None:
        users_group_id = group.id
        conditions.extend(
            [
                File.shared_with.contains([users_group_id]),
                Groups.group_id == users_group_id,
            ]
        )

    # TODO
    # the query below is not working as expected
    # sqlalchemy.exc.MultipleResultsFound: Multiple rows were found when one or none was required

    # has no tests yet
    query = (
        db.session.query(File)
        .join(Dataset, File.dataset_id == Dataset.id)
        .join(Groups, File.dataset_id == Groups.dataset_id)
        # .filter(or_(*conditions))
        .filter(File.upload_finished.is_(True))
        .filter(File.enabled.is_(True))
        .filter(Groups.dataset_id == dataset.id)
        .filter(File.name == file_name)
        .filter(File.version == file_version)
        .with_entities(File.name)
        .one_or_none()
    )

    if query is None:
        return False

    return True
