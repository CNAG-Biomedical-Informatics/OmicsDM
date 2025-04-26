--
-- PostgreSQL database dump (modified from the original: prod_omicsdm_3tr_schema.sql):
--

-- Dumped from database version 11.2
-- Dumped by pg_dump version 11.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: prod_omicsdm_3tr_rw
--

CREATE TABLE public.projects (
    id SERIAL NOT NULL,
    project_id VARCHAR NOT NULL,
    name VARCHAR,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    last_updated_at TIMESTAMP WITHOUT TIME ZONE,
    last_updated_by VARCHAR,
    last_update VARCHAR,
    owners INTEGER[] NOT NULL,
    dataset_visibility_default_private BOOLEAN,
    dataset_visibility_changeable BOOLEAN,
    file_dl_allowed BOOLEAN,
    diseases VARCHAR[],
    PRIMARY KEY (id)
);

ALTER TABLE public.projects OWNER TO prod_omicsdm_3tr_rw;

CREATE TABLE public.project_dataset (
    project_id INTEGER NOT NULL,
    dataset_id INTEGER NOT NULL
);

ALTER TABLE public.project_dataset OWNER TO prod_omicsdm_3tr_rw;

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
    private boolean,
    submitter_name character varying(120) NOT NULL,
    submission_date timestamp without time zone NOT NULL,
    shared_with integer[] NOT NULL,
    status character varying(120) NOT NULL,
    analysis_settings json
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
    name character varying(120) NOT NULL,
    description character varying(120) NOT NULL,
    tags character varying(120) NOT NULL,
    responsible_partner character varying(120) NOT NULL,
    disease character varying(120) NOT NULL,
    treatment character varying(120) NOT NULL,
    category character varying(120) NOT NULL,
    private boolean,
    submitter_name character varying(120) NOT NULL,
    submission_date timestamp without time zone NOT NULL,
    shared_with integer[] NOT NULL
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
    platform character varying(120) NOT NULL,
    comment character varying(120) NOT NULL,
    submitter_name character varying(120) NOT NULL,
    submission_date timestamp without time zone NOT NULL,
    version integer NOT NULL,
    enabled boolean NOT NULL,
    shared_with integer[] NOT NULL
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


ALTER TABLE ONLY public.project_dataset
    ADD CONSTRAINT project_dataset_pkey PRIMARY KEY (project_id, dataset_id);

ALTER TABLE ONLY public.project_dataset
    ADD CONSTRAINT project_dataset_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);

ALTER TABLE ONLY public.project_dataset
    ADD CONSTRAINT project_dataset_dataset_id_fkey FOREIGN KEY (dataset_id) REFERENCES public.datasets(id);

--
-- PostgreSQL database dump complete
--
