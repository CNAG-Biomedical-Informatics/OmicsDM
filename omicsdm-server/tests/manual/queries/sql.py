# %%
# https://stackoverflow.com/questions/41004540/using-sqlalchemy-models-in-and-out-of-flask
import pandas as pd
from IPython.display import display
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy import or_

from model_debug import Group, Dataset, Groups, File

# %%
# helpers


def init_query(table):
    engine = create_engine(
        "postgresql://postgres:password@192.168.0.2:5432/postgres"
    )

    with Session(engine) as session:
        return session.query(table)


def pick_columns(columns):

    entities = []
    for table in columns.keys():
        entities.extend(
            eval(f"{table.__name__}.{col}") for col in columns[table]
        )
    return entities


def df_from_query(query, columns):
    cols = pick_columns(columns)
    results = query.with_entities(*cols).all()
    return pd.DataFrame.from_records(results, columns=map(str, cols))


# %%
# get all keycloak groups
cols = {Group: ["kc_groupname", "id"]}
table = list(cols.keys())[0]
groups_df = df_from_query(init_query(table), cols)
display(groups_df)

# %%
# get dataset to group mapping
cols = {Groups: ["dataset_id", "group_id"]}
table = list(cols.keys())[0]
ds2group_df = df_from_query(init_query(table), cols)
display(ds2group_df)

# %%
# get all datasets
cols = {Dataset: ["id", "dataset_id", "private", "shared_with"]}
table = list(cols.keys())[0]
ds_df = df_from_query(init_query(table), cols)
display(ds_df)

# %%
# get all files
cols = {
    File: ["id", "dataset_id", "name", "version", "enabled", "shared_with"]
}
table = list(cols.keys())[0]
files_df = df_from_query(init_query(table), cols)
display(files_df)

# %%
# get the dataset owner (=keycloak group)
cols = {Group: ["id", "kc_groupname"]}
table = list(cols.keys())[0]
query = init_query(table)
query = query.filter(table.id == 1)
owner_df = df_from_query(query, cols)
print(query)
display(owner_df)
# %%
# get the file owner based on the file id
file_id = 1
cols = {Group: ["kc_groupname"], Dataset: ["dataset_id"], File: ["id", "name"]}
query = init_query(Group)
query = (
    query.join(Groups, Group.id == Groups.group_id)
    .join(Dataset, Dataset.id == Groups.dataset_id)
    .join(File, File.dataset_id == Dataset.id)
    .filter(File.id == file_id)
)
owner_df = df_from_query(query, cols)
print(query)
display(owner_df)
# %%
# get datasets based on keycloak group id
users_group_id = 1
cols = {
    Dataset: ["id", "dataset_id", "private", "shared_with"],
    Groups: ["dataset_id", "group_id"],
}
table = list(cols.keys())[0]

conditions = []
conditions.append(table.shared_with.contains([users_group_id]))
conditions.append(Groups.group_id == users_group_id)

query = init_query(table)
query = query.join(Groups, Groups.dataset_id == table.id)
query = query.filter(or_(*conditions))
# query.filter(Groups.group_id == users_group_id)
print(query)

ds_df = df_from_query(query, cols)
display(ds_df)

# %%
# get datasets based on keycloak group name
users_group_id = 1
cols = {
    Dataset: ["id", "dataset_id", "private", "shared_with"],
    Groups: ["dataset_id", "group_id"],
    Group: ["kc_groupname"],
}
table = list(cols.keys())[0]

conditions = []
conditions.append(Group.kc_groupname == "3tr")

query = init_query(table)
query = query.join(Groups, Groups.dataset_id == table.id)
query = query.join(Group, Group.id == Groups.group_id)
query = query.filter(or_(*conditions))
# query.filter(Groups.group_id == users_group_id)
print(query)

ds_df = df_from_query(query, cols)
display(ds_df)

# %%
# get files based on keycloak group name
users_group_id = 1
cols = {
    File: ["id", "name", "dataset_id", "shared_with", "enabled"],
    Dataset: ["id", "private", "shared_with"],
    Groups: ["dataset_id", "group_id"],
}
table = list(cols.keys())[0]

conditions = []
conditions.append(table.shared_with.contains([users_group_id]))
conditions.append(Groups.group_id == users_group_id)
conditions.append(Dataset.private.is_(False))

query = init_query(table)
query = query.join(Dataset, Dataset.id == table.dataset_id)
query = query.join(Groups, Groups.dataset_id == Dataset.id)
query = query.filter(File.enabled.is_(True))
query = query.filter(or_(*conditions))
print(query)

ds_df = df_from_query(query, cols)
display(ds_df)

# %%
# filter files by dataset id
users_group_id = 1
dataset_id = "test"
cols = {
    File: ["id", "name", "dataset_id", "shared_with", "enabled"],
    Dataset: ["id", "private", "shared_with"],
    Groups: ["dataset_id", "group_id"],
}
table = list(cols.keys())[0]

conditions = []
conditions.append(table.shared_with.contains([users_group_id]))
conditions.append(Groups.group_id == users_group_id)
conditions.append(Dataset.private.is_(False))

query = init_query(table)
query = query.join(Dataset, Dataset.id == table.dataset_id)
query = query.join(Groups, Groups.dataset_id == Dataset.id)
query = query.filter(File.enabled.is_(True))
query = query.filter(or_(*conditions))
query = query.filter(Dataset.dataset_id == dataset_id)
print(query)

ds_df = df_from_query(query, cols)
display(ds_df)

# %%
# get files based on file name, dataset id and keycloak group id
# used in file.py: startUpload
users_group_id = 1
dataset_id = "test"
file_name = "testfile1.csv"
cols = {
    File: ["id", "dataset_id", "enabled", "version"],
    Dataset: ["private", "shared_with"],
    Groups: ["group_id"],
}

query = init_query(File)
query = (
    query.join(Dataset, File.dataset_id == Dataset.id)
    .join(Groups, Groups.dataset_id == Dataset.id)
    .filter(File.name == file_name)
    .filter(File.enabled.is_(True))
    .filter(Dataset.dataset_id == dataset_id)
    .filter(Groups.group_id == users_group_id)
    .order_by(File.version.desc())
)
print(query)
ds_df = df_from_query(query, cols)
display(ds_df)
# %%
# debug file.py finish upload
# map dataset_id (string) to dataset.id (int) [=row in sql table]
# but make sure that the keycloak group is the dataset_owner
users_group_id = 1
dataset_id = "test"

cols = {
    Dataset: ["private", "shared_with"],
    Groups: ["group_id"],
}

query = init_query(Dataset)
query = (
    query.join(Groups, Dataset.id == Groups.dataset_id)
    .filter(Groups.group_id == users_group_id)
    .filter(Dataset.dataset_id == dataset_id)
)

ds_df = df_from_query(query, cols)
dataset_id = int(ds_df.iloc[0]["Groups.group_id"])


cols = {
    File: [
        "id",
        "name",
        "version",
        "dataset_id",
        "enabled",
        "submission_date",
    ],
}
query = init_query(File)
query = (
    query.filter(File.dataset_id == dataset_id)
    .filter(File.name == file_name)
    .order_by(File.submission_date.desc())
)

files_df = df_from_query(query, cols)
display(files_df)
