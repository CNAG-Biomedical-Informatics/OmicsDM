-- got a new integration dump based on that
-- the populate file had to be updated

INSERT INTO public."group" (kc_groupname)
VALUES ('group1');

INSERT INTO public.projects (
    project_id,
    name,
    created_at,
    owners
)
VALUES (
    'project_id_1',
    'project_name_1',
    current_timestamp,
    '{1,2}'
);

INSERT INTO public.datasets (
    dataset_id,
    name,
    private,
    submitter_name,
    submission_date,
    shared_with
)
VALUES (
    'dataset_id_1',
    'dataset_name_1',
    TRUE,
    'submitter_name_1',
    current_timestamp,
    '{1,2}'
);

INSERT INTO public.dataset_group (
    dataset_id,
    group_id,
    owner
)
VALUES (
    1,
    1,
    TRUE
);

INSERT INTO public.project_dataset (
    project_id,
    dataset_id
)
VALUES (
    1,
    1
);

INSERT INTO public.files (
    dataset_id,
    name,
    submitter_name,
    submission_date,
    version,
    enabled,
    shared_with
)
VALUES (
    1,
    'file_name_1',
    'submitter_name_1',
    current_timestamp,
    1,
    TRUE,
    '{1,2}'
);

INSERT INTO public.analyses (
    analysis_id,
    name,
    tags,
    description,
    dataset_ids,
    file_ids,
    private,
    submitter_name,
    submission_date,
    shared_with,
    status,
    analysis_settings,
    jenkins_jobs,
    extra_cols
)
VALUES (
    'analysis_id_1',
    'analysis_name_1',
    'tags_1',
    'desc_1',
    '{1,2}',
    '{1,2}',
    TRUE,
    'submitter_name_1',
    current_timestamp,
    '{1,2}',
    'status_1',
    '{"pipeline" : "deseq2"}',
    '{"job" : "run-pipeline"}',
    '{"extra" : "information"}'
);

INSERT INTO public.analysis_group (
    analysis_id,
    group_id,
    owner
)
VALUES (
    1,
    1,
    TRUE
);

INSERT INTO public.history (
    entity_id,
    timestamp,
    username,
    groups,
    endpoint,
    method,
    content
)
VALUES (
    'create',
    current_timestamp,
    'user_1',
    'group_1',
    'http://localhost:8082/api/projects/all',
    'POST',
    '{"data":[{"id":"proj1","name":"project1"}]}'
);
