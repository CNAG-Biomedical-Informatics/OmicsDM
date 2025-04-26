BEGIN;

ALTER TABLE projects ADD COLUMN extra_cols JSONB;

ALTER TABLE projects DROP COLUMN dataset_visibility_changeable;

ALTER TABLE projects DROP COLUMN file_dl_allowed;

ALTER TABLE projects DROP COLUMN dataset_visibility_default_private;

ALTER TABLE projects DROP COLUMN diseases;

ALTER TABLE analyses ALTER COLUMN private SET NOT NULL;

ALTER TABLE analyses ALTER COLUMN private SET DEFAULT true;

ALTER TABLE analyses DROP COLUMN analysis_settings;

ALTER TABLE analyses ADD COLUMN extra_cols JSONB;

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
