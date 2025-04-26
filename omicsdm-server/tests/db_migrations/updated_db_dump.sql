--
-- PostgreSQL database dump
--

-- Dumped from database version 13.3 (Debian 13.3-1.pgdg100+1)
-- Dumped by pg_dump version 13.3 (Debian 13.3-1.pgdg100+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: analyses; Type: TABLE; Schema: public; Owner: prod_omicsdm_3tr_rw
--

CREATE TABLE public.analyses (
    id integer NOT NULL,
    analysis_id character varying(120) NOT NULL,
    name character varying(120) NOT NULL,
    tags character varying(120) NOT NULL,
    description character varying(120) NOT NULL,
    dataset_ids integer[] NOT NULL,
    file_ids integer[] NOT NULL,
    private boolean DEFAULT true NOT NULL,
    submitter_name character varying(120) NOT NULL,
    submission_date timestamp without time zone NOT NULL,
    shared_with integer[] NOT NULL,
    status character varying(120) NOT NULL,
    extra_cols jsonb NOT NULL
);


ALTER TABLE public.analyses OWNER TO prod_omicsdm_3tr_rw;

--
-- Name: analyses_id_seq; Type: SEQUENCE; Schema: public; Owner: prod_omicsdm_3tr_rw
--

CREATE SEQUENCE public.analyses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.analyses_id_seq OWNER TO prod_omicsdm_3tr_rw;

--
-- Name: analyses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prod_omicsdm_3tr_rw
--

ALTER SEQUENCE public.analyses_id_seq OWNED BY public.analyses.id;


--
-- Name: analysis_group; Type: TABLE; Schema: public; Owner: prod_omicsdm_3tr_rw
--

CREATE TABLE public.analysis_group (
    analysis_id integer NOT NULL,
    group_id integer NOT NULL,
    owner boolean
);


ALTER TABLE public.analysis_group OWNER TO prod_omicsdm_3tr_rw;

--
-- Name: dataset_group; Type: TABLE; Schema: public; Owner: prod_omicsdm_3tr_rw
--

CREATE TABLE public.dataset_group (
    dataset_id integer NOT NULL,
    group_id integer NOT NULL,
    owner boolean
);


ALTER TABLE public.dataset_group OWNER TO prod_omicsdm_3tr_rw;

--
-- Name: datasets; Type: TABLE; Schema: public; Owner: prod_omicsdm_3tr_rw
--

CREATE TABLE public.datasets (
    id integer NOT NULL,
    dataset_id character varying(120) NOT NULL,
    name character varying(120),
    private boolean DEFAULT true NOT NULL,
    submitter_name character varying(120) NOT NULL,
    submission_date timestamp without time zone NOT NULL,
    shared_with integer[] NOT NULL,
    project_id integer DEFAULT 0 NOT NULL,
    extra_cols jsonb
);


ALTER TABLE public.datasets OWNER TO prod_omicsdm_3tr_rw;

--
-- Name: datasets_id_seq; Type: SEQUENCE; Schema: public; Owner: prod_omicsdm_3tr_rw
--

CREATE SEQUENCE public.datasets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.datasets_id_seq OWNER TO prod_omicsdm_3tr_rw;

--
-- Name: datasets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prod_omicsdm_3tr_rw
--

ALTER SEQUENCE public.datasets_id_seq OWNED BY public.datasets.id;


--
-- Name: files; Type: TABLE; Schema: public; Owner: prod_omicsdm_3tr_rw
--

CREATE TABLE public.files (
    id integer NOT NULL,
    dataset_id integer NOT NULL,
    name character varying(120) NOT NULL,
    submitter_name character varying(120) NOT NULL,
    submission_date timestamp without time zone NOT NULL,
    version integer NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    shared_with integer[] NOT NULL,
    upload_finished boolean DEFAULT false NOT NULL,
    extra_cols jsonb
);


ALTER TABLE public.files OWNER TO prod_omicsdm_3tr_rw;

--
-- Name: files_id_seq; Type: SEQUENCE; Schema: public; Owner: prod_omicsdm_3tr_rw
--

CREATE SEQUENCE public.files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.files_id_seq OWNER TO prod_omicsdm_3tr_rw;

--
-- Name: files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prod_omicsdm_3tr_rw
--

ALTER SEQUENCE public.files_id_seq OWNED BY public.files.id;


--
-- Name: group; Type: TABLE; Schema: public; Owner: prod_omicsdm_3tr_rw
--

CREATE TABLE public."group" (
    id integer NOT NULL,
    kc_groupname character varying NOT NULL
);


ALTER TABLE public."group" OWNER TO prod_omicsdm_3tr_rw;

--
-- Name: group_id_seq; Type: SEQUENCE; Schema: public; Owner: prod_omicsdm_3tr_rw
--

CREATE SEQUENCE public.group_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.group_id_seq OWNER TO prod_omicsdm_3tr_rw;

--
-- Name: group_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prod_omicsdm_3tr_rw
--

ALTER SEQUENCE public.group_id_seq OWNED BY public."group".id;


--
-- Name: history; Type: TABLE; Schema: public; Owner: prod_omicsdm_3tr_rw
--

CREATE TABLE public.history (
    id integer NOT NULL,
    entity_id character varying(1000) NOT NULL,
    "timestamp" timestamp without time zone NOT NULL,
    username character varying(120) NOT NULL,
    groups character varying(300) NOT NULL,
    endpoint character varying(1000) NOT NULL,
    method character varying(120) NOT NULL,
    content jsonb
);


ALTER TABLE public.history OWNER TO prod_omicsdm_3tr_rw;

--
-- Name: history_id_seq; Type: SEQUENCE; Schema: public; Owner: prod_omicsdm_3tr_rw
--

CREATE SEQUENCE public.history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.history_id_seq OWNER TO prod_omicsdm_3tr_rw;

--
-- Name: history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prod_omicsdm_3tr_rw
--

ALTER SEQUENCE public.history_id_seq OWNED BY public.history.id;


--
-- Name: project_dataset; Type: TABLE; Schema: public; Owner: prod_omicsdm_3tr_rw
--

CREATE TABLE public.project_dataset (
    project_id integer NOT NULL,
    dataset_id integer NOT NULL
);


ALTER TABLE public.project_dataset OWNER TO prod_omicsdm_3tr_rw;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: prod_omicsdm_3tr_rw
--

CREATE TABLE public.projects (
    id integer NOT NULL,
    project_id character varying NOT NULL,
    name character varying,
    description character varying,
    created_at timestamp without time zone,
    last_updated_at timestamp without time zone,
    last_updated_by character varying,
    last_update character varying,
    owners integer[] NOT NULL,
    extra_cols jsonb
);


ALTER TABLE public.projects OWNER TO prod_omicsdm_3tr_rw;

--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: prod_omicsdm_3tr_rw
--

CREATE SEQUENCE public.projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.projects_id_seq OWNER TO prod_omicsdm_3tr_rw;

--
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prod_omicsdm_3tr_rw
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- Name: analyses id; Type: DEFAULT; Schema: public; Owner: prod_omicsdm_3tr_rw
--

ALTER TABLE ONLY public.analyses ALTER COLUMN id SET DEFAULT nextval('public.analyses_id_seq'::regclass);


--
-- Name: datasets id; Type: DEFAULT; Schema: public; Owner: prod_omicsdm_3tr_rw
--

ALTER TABLE ONLY public.datasets ALTER COLUMN id SET DEFAULT nextval('public.datasets_id_seq'::regclass);


--
-- Name: files id; Type: DEFAULT; Schema: public; Owner: prod_omicsdm_3tr_rw
--

ALTER TABLE ONLY public.files ALTER COLUMN id SET DEFAULT nextval('public.files_id_seq'::regclass);


--
-- Name: group id; Type: DEFAULT; Schema: public; Owner: prod_omicsdm_3tr_rw
--

ALTER TABLE ONLY public."group" ALTER COLUMN id SET DEFAULT nextval('public.group_id_seq'::regclass);


--
-- Name: history id; Type: DEFAULT; Schema: public; Owner: prod_omicsdm_3tr_rw
--

ALTER TABLE ONLY public.history ALTER COLUMN id SET DEFAULT nextval('public.history_id_seq'::regclass);


--
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: prod_omicsdm_3tr_rw
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- Data for Name: analyses; Type: TABLE DATA; Schema: public; Owner: prod_omicsdm_3tr_rw
--

COPY public.analyses (id, analysis_id, name, tags, description, dataset_ids, file_ids, private, submitter_name, submission_date, shared_with, status, extra_cols) FROM stdin;
\.


--
-- Data for Name: analysis_group; Type: TABLE DATA; Schema: public; Owner: prod_omicsdm_3tr_rw
--

COPY public.analysis_group (analysis_id, group_id, owner) FROM stdin;
\.


--
-- Data for Name: dataset_group; Type: TABLE DATA; Schema: public; Owner: prod_omicsdm_3tr_rw
--

COPY public.dataset_group (dataset_id, group_id, owner) FROM stdin;
1	1	t
\.


--
-- Data for Name: datasets; Type: TABLE DATA; Schema: public; Owner: prod_omicsdm_3tr_rw
--

COPY public.datasets (id, dataset_id, name, private, submitter_name, submission_date, shared_with, project_id, extra_cols) FROM stdin;
1	dataset_id_1	dataset_name_1	t	submitter_name_1	2022-07-06 09:30:51.170248	{1,2}	0	\N
\.


--
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: prod_omicsdm_3tr_rw
--

COPY public.files (id, dataset_id, name, submitter_name, submission_date, version, enabled, shared_with, upload_finished, extra_cols) FROM stdin;
1	1	file_name_1	submitter_name_1	2022-07-06 09:30:51.172068	1	t	{1,2}	f	\N
\.


--
-- Data for Name: group; Type: TABLE DATA; Schema: public; Owner: prod_omicsdm_3tr_rw
--

COPY public."group" (id, kc_groupname) FROM stdin;
1	group1
\.


--
-- Data for Name: history; Type: TABLE DATA; Schema: public; Owner: prod_omicsdm_3tr_rw
--

COPY public.history (id, entity_id, "timestamp", username, groups, endpoint, method, content) FROM stdin;
1	create	2022-07-06 09:30:51.172785	user_1	group_1	http://localhost:8082/api/projects/all	POST	{"data": [{"id": "proj1", "name": "project1"}]}
\.


--
-- Data for Name: project_dataset; Type: TABLE DATA; Schema: public; Owner: prod_omicsdm_3tr_rw
--

COPY public.project_dataset (project_id, dataset_id) FROM stdin;
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: prod_omicsdm_3tr_rw
--

COPY public.projects (id, project_id, name, description, created_at, last_updated_at, last_updated_by, last_update, owners, extra_cols) FROM stdin;
\.


--
-- Name: analyses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prod_omicsdm_3tr_rw
--

SELECT pg_catalog.setval('public.analyses_id_seq', 1, false);


--
-- Name: datasets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prod_omicsdm_3tr_rw
--

SELECT pg_catalog.setval('public.datasets_id_seq', 1, true);


--
-- Name: files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prod_omicsdm_3tr_rw
--

SELECT pg_catalog.setval('public.files_id_seq', 1, true);


--
-- Name: group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prod_omicsdm_3tr_rw
--

SELECT pg_catalog.setval('public.group_id_seq', 1, true);


--
-- Name: history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prod_omicsdm_3tr_rw
--

SELECT pg_catalog.setval('public.history_id_seq', 1, true);


--
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prod_omicsdm_3tr_rw
--

SELECT pg_catalog.setval('public.projects_id_seq', 1, false);


--
-- Name: analyses analyses_pkey; Type: CONSTRAINT; Schema: public; Owner: prod_omicsdm_3tr_rw
--

ALTER TABLE ONLY public.analyses
    ADD CONSTRAINT analyses_pkey PRIMARY KEY (id);


--
-- Name: analysis_group analysis_group_pkey; Type: CONSTRAINT; Schema: public; Owner: prod_omicsdm_3tr_rw
--

ALTER TABLE ONLY public.analysis_group
    ADD CONSTRAINT analysis_group_pkey PRIMARY KEY (analysis_id, group_id);


--
-- Name: dataset_group dataset_group_pkey; Type: CONSTRAINT; Schema: public; Owner: prod_omicsdm_3tr_rw
--

ALTER TABLE ONLY public.dataset_group
    ADD CONSTRAINT dataset_group_pkey PRIMARY KEY (dataset_id, group_id);


--
-- Name: datasets datasets_pkey; Type: CONSTRAINT; Schema: public; Owner: prod_omicsdm_3tr_rw
--

ALTER TABLE ONLY public.datasets
    ADD CONSTRAINT datasets_pkey PRIMARY KEY (id);


--
-- Name: files files_pkey; Type: CONSTRAINT; Schema: public; Owner: prod_omicsdm_3tr_rw
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_pkey PRIMARY KEY (id, dataset_id);


--
-- Name: group group_pkey; Type: CONSTRAINT; Schema: public; Owner: prod_omicsdm_3tr_rw
--

ALTER TABLE ONLY public."group"
    ADD CONSTRAINT group_pkey PRIMARY KEY (id);


--
-- Name: history history_pkey; Type: CONSTRAINT; Schema: public; Owner: prod_omicsdm_3tr_rw
--

ALTER TABLE ONLY public.history
    ADD CONSTRAINT history_pkey PRIMARY KEY (id);


--
-- Name: project_dataset project_dataset_pkey; Type: CONSTRAINT; Schema: public; Owner: prod_omicsdm_3tr_rw
--

ALTER TABLE ONLY public.project_dataset
    ADD CONSTRAINT project_dataset_pkey PRIMARY KEY (project_id, dataset_id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: prod_omicsdm_3tr_rw
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: analysis_group analysis_group_analysis_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prod_omicsdm_3tr_rw
--

ALTER TABLE ONLY public.analysis_group
    ADD CONSTRAINT analysis_group_analysis_id_fkey FOREIGN KEY (analysis_id) REFERENCES public.analyses(id);


--
-- Name: analysis_group analysis_group_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prod_omicsdm_3tr_rw
--

ALTER TABLE ONLY public.analysis_group
    ADD CONSTRAINT analysis_group_group_id_fkey FOREIGN KEY (group_id) REFERENCES public."group"(id);


--
-- Name: dataset_group dataset_group_dataset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prod_omicsdm_3tr_rw
--

ALTER TABLE ONLY public.dataset_group
    ADD CONSTRAINT dataset_group_dataset_id_fkey FOREIGN KEY (dataset_id) REFERENCES public.datasets(id);


--
-- Name: dataset_group dataset_group_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prod_omicsdm_3tr_rw
--

ALTER TABLE ONLY public.dataset_group
    ADD CONSTRAINT dataset_group_group_id_fkey FOREIGN KEY (group_id) REFERENCES public."group"(id);


--
-- Name: files files_dataset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prod_omicsdm_3tr_rw
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_dataset_id_fkey FOREIGN KEY (dataset_id) REFERENCES public.datasets(id);


--
-- Name: project_dataset project_dataset_dataset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prod_omicsdm_3tr_rw
--

ALTER TABLE ONLY public.project_dataset
    ADD CONSTRAINT project_dataset_dataset_id_fkey FOREIGN KEY (dataset_id) REFERENCES public.datasets(id);


--
-- Name: project_dataset project_dataset_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prod_omicsdm_3tr_rw
--

ALTER TABLE ONLY public.project_dataset
    ADD CONSTRAINT project_dataset_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- PostgreSQL database dump complete
--
