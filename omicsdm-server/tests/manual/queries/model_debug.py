from datetime import datetime

from sqlalchemy import (
    MetaData,
    Column,
    Integer,
    String,
    ForeignKey,
    Boolean,
    DateTime,
)

from sqlalchemy.dialects.postgresql import ARRAY, JSONB

# from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.ext.declarative import declarative_base

metadata = MetaData()
Base = declarative_base(metadata=metadata)


class Groups(Base):
    """
    Link between tables datasets and group.
    Provides permissions to datasets based on keycloak groups
    """

    __tablename__ = "dataset_group"

    dataset_id = Column(Integer, ForeignKey("datasets.id"), primary_key=True)
    group_id = Column(Integer, ForeignKey("group.id"), primary_key=True)
    owner = Column(Boolean)


class Group(Base):
    """
    Contains the keycloak groups e.g. granada
    """

    __tablename__ = "group"

    id = Column(Integer, primary_key=True, autoincrement=True)
    kc_groupname = Column(String, nullable=False)


class Project(Base):
    """
    Contains the projects e.g. 3TR, PRECISEDADS

    Schema (see model.py)
    """

    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_updated_at = Column(DateTime, nullable=True)
    last_updated_by = Column(String, nullable=True)
    last_update = Column(String, nullable=True)
    owner = Column(ARRAY(Integer), nullable=False)
    dataset_visibility_changeable = Column(
        String, default=False
    )  # 3TR default is True
    file_dl_allowed = Column(Boolean, default=False)
    diseases = Column(ARRAY(String), nullable=True)


class ProjectMapping(Base):
    """
    Link between tables project and datasets
    """

    __tablename__ = "project_dataset"

    project_id = Column(Integer, ForeignKey("projects.id"), primary_key=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), primary_key=True)


class Dataset(Base):

    """
    Schema and functions for the table projects
    - id = autoincremented integer
    - project_id = Opal project id
    - name = Opal project name human readable
    - tags = Opal project tags
    - responsible_partner = requirement by 3TR
    - disease = 1 of the 7 diseases within 3TR
    - treament = administered drug and such a like
    - category = based on the 3TR "profiling menu"
    - visibility = private to this project or visible to all
    - shared_with = kcloak groups which are able to see that project (0 = ALL)
    - submitter_name = kcloak id of the one who created the project
    - submission_date = dataset creation date in utc
    - groups = keycloak groups of the 'submitter_name'
    """

    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, autoincrement=True)
    dataset_id = Column(String(120), nullable=False)
    name = Column(String(120), nullable=False)
    description = Column(String(120), nullable=False)
    tags = Column(String(120), nullable=False)
    responsible_partner = Column(String(120), nullable=False)
    disease = Column(String(120), nullable=False)
    treatment = Column(String(120), nullable=False)
    category = Column(String(120), nullable=False)
    private = Column(Boolean, default=True)
    submitter_name = Column(String(120), nullable=False)
    submission_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    shared_with = Column(ARRAY(Integer), nullable=False)


class File(Base):

    """
    Schema and functions for the table files
    - id = autoincremented integer
    - project_id = Opal project id
    - name = filename (TODO we might need to hash it in the future)
    - platform = based on the 3TR "profiling menu"
    - comment = platform used which is not in the platform dropdown
    - submitter_name = keycloak id of the one who created the project
    - groups = keycloak groups of the 'submitter_name'
    - submission_date = file submission date in utc
    - version = file version (integer)
    - enabled = file upload state True=in progress | False=finished

    - shared_with = keycloak groups which are able to see that file (0 = ALL)
    """

    __tablename__ = "files"

    id = Column(Integer, primary_key=True, autoincrement=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), primary_key=True)
    name = Column(String(120), nullable=False)
    platform = Column(String(120), nullable=False)
    comment = Column(String(120), nullable=False)
    submitter_name = Column(String(120), nullable=False)
    submission_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    version = Column(Integer, nullable=False)
    enabled = Column(Boolean, nullable=False)
    shared_with = Column(ARRAY(Integer), nullable=False)


class History(Base):

    """
    Schema and functions for the table history
    """

    __tablename__ = "history"

    # TODO
    # change entity id length on integration

    id = Column(Integer, primary_key=True)
    entity_id = Column(String(1000), nullable=False)
    # entity_id = Column(String(300), nullable=False)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)
    username = Column(String(120), nullable=False)
    groups = Column(String(300), nullable=False)
    endpoint = Column(String(1000), nullable=False)
    method = Column(String(120), nullable=False)
    content = Column(JSONB)
