BEGIN;

CREATE TABLE projects (
    id SERIAL NOT NULL,
    project_id VARCHAR NOT NULL,
    name VARCHAR,
    description VARCHAR,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    last_updated_at TIMESTAMP WITHOUT TIME ZONE,
    last_updated_by VARCHAR,
    last_update VARCHAR,
    owners INTEGER[] NOT NULL,
    extra_cols JSONB,
    PRIMARY KEY (id)
);


CREATE TABLE project_dataset (
    project_id INTEGER NOT NULL,
    dataset_id INTEGER NOT NULL,
    PRIMARY KEY (project_id, dataset_id),
    FOREIGN KEY(dataset_id) REFERENCES datasets (id),
    FOREIGN KEY(project_id) REFERENCES projects (id)
);

ALTER TABLE analyses ALTER COLUMN private SET NOT NULL;

ALTER TABLE analyses ALTER COLUMN private SET DEFAULT true;

ALTER TABLE analyses DROP COLUMN analysis_settings;

ALTER TABLE analyses ADD COLUMN extra_cols JSONB NOT NULL;

ALTER TABLE datasets ADD COLUMN project_id INTEGER NOT NULL DEFAULT '0';

ALTER TABLE datasets ADD COLUMN extra_cols JSONB;

ALTER TABLE datasets ALTER COLUMN name DROP NOT NULL;

ALTER TABLE datasets ALTER COLUMN private SET NOT NULL;

ALTER TABLE datasets ALTER COLUMN private SET DEFAULT true;

ALTER TABLE datasets DROP COLUMN treatment;

ALTER TABLE datasets DROP COLUMN responsible_partner;

ALTER TABLE datasets DROP COLUMN tags;

ALTER TABLE datasets DROP COLUMN disease;

ALTER TABLE datasets DROP COLUMN description;

ALTER TABLE datasets DROP COLUMN category;

ALTER TABLE files ADD COLUMN upload_finished BOOLEAN NOT NULL DEFAULT false;

update files set enabled= true where enabled is null;

ALTER TABLE files ALTER COLUMN enabled SET DEFAULT true;

ALTER TABLE files ALTER COLUMN upload_finished SET DEFAULT false;

ALTER TABLE files ADD COLUMN extra_cols JSONB;

ALTER TABLE files DROP COLUMN platform;

ALTER TABLE files DROP COLUMN comment;

COMMIT;
