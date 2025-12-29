# Combined Pipeline for Bulk and Single-cell RNA-seq Analysis

## Goal

One Docker container image that is able to run the entire pipeline, integrating both bulk RNA-seq and single-cell RNA-seq analyses.

## Pipeline Overview

### Bulk RNA-seq Pipeline
1. **DESeq2** - Differential expression analysis
2. **FGSEA** - Functional gene set enrichment analysis (uses DESeq2 output)

### Single-cell RNA-seq Pipeline
3. **sc_normalisation** - Single-cell data normalization

### Gene Set Scoring Pipelines
Uses significant gene sets from FGSEA as input for:
4. **z_scoring** - Z-score based gene set scoring
5. **gsva** - GSVA gene set scoring

## Pipeline Dependencies

```
DESeq2 → FGSEA → z_scoring
              ↘
sc_normalisation → gsva
```

- FGSEA depends on DESeq2 output
- z_scoring and gsva both depend on:
  - FGSEA significant gene sets output
  - sc_normalisation normalized data

## Directory Structure

```
all/
├── Dockerfile              # Combined Docker image with R and Python
├── docker-compose.yaml     # Docker Compose configuration
├── Snakefile              # Main Snakemake workflow
├── makefile               # Build and run commands
├── requirements.txt       # Python dependencies
├── renv.lock             # R dependencies
├── config/               # Configuration files for each pipeline
│   ├── deseq2.json
│   ├── fgsea.json
│   ├── sc_normalisation.json
│   ├── z_scoring.json
│   └── gsva.json
├── src/                  # Source scripts (symlinked from individual pipelines)
│   ├── deseq2/
│   ├── fgsea/
│   ├── sc_normalisation/
│   ├── z_scoring/
│   ├── gsva/
│   ├── lib/
│   └── report/
└── rules/                # Snakemake rules
    └── renv.smk
```

## Building the Docker Image

```bash
make build
```

Or manually:

```bash
docker build -t omicsdm-all-pipeline:latest .
```

## Running the Pipeline

### Using Make

```bash
# Run the complete pipeline
make run

# Open a shell in the container
make shell

# Clean output directories
make clean
```

### Using Docker Directly

```bash
docker run --rm \
  -v $(PWD)/Snakefile:/home/Snakefile:ro \
  -v $(PWD)/src:/home/src:ro \
  -v $(PWD)/config:/home/config:ro \
  -v $(PWD)/docker-out:/home/out \
  --add-host minio.omicsdm.cnag.dev:172.16.10.112 \
  -it omicsdm-all-pipeline:latest /home/venv/bin/snakemake -F
```

## Configuration

Each pipeline component requires its own configuration file in the `config/` directory:

- `deseq2.json` - DESeq2 analysis configuration
- `fgsea.json` - FGSEA analysis configuration
- `sc_normalisation.json` - Single-cell normalization configuration
- `z_scoring.json` - Z-scoring configuration
- `gsva.json` - GSVA configuration

## Outputs

The pipeline generates outputs in the following structure:

```
out/
├── results/
│   ├── deseq2/                # DESeq2 analysis results
│   ├── fgsea/                 # FGSEA results including significant_genesets.gmt
│   ├── sc_normalisation/      # Normalized single-cell data
│   ├── z_scoring/             # Z-score results
│   └── gsva/                  # GSVA results
├── _main.html                 # Combined report
└── _book/                     # Report book directory
```

## Key Features

1. **Single Docker Image**: All dependencies (R, Python, Bioconductor packages, Python packages) in one container
2. **Snakemake Orchestration**: Automatic dependency management and parallel execution
3. **Modular Design**: Each pipeline component is independent but integrated
4. **Reproducible**: Version-controlled dependencies via renv.lock and requirements.txt

## Technical Details

### Docker Image
- Base: rocker/r-ver:4.4.0
- R version: 4.4.0
- Python: 3.10
- Includes: Snakemake, awscli, R packages (DESeq2, fgsea, etc.), Python packages (scanpy, anndata, etc.)

### Dependencies
- **R packages**: Managed via renv (see renv.lock)
- **Python packages**: Listed in requirements.txt
- **System packages**: Defined in Dockerfile

## Troubleshooting

### Dry Run
Test the pipeline structure without execution:

```bash
cd /path/to/all
snakemake --dry-run -j1
```

### View DAG
Visualize the pipeline workflow:

```bash
snakemake --dag | dot -Tpdf > dag.pdf
```

## Development

### Adding New Pipeline Steps

1. Create source scripts in appropriate subdirectory under `src/`
2. Add rule to `Snakefile`
3. Update configuration if needed
4. Test with `snakemake --dry-run`

### Updating Dependencies

**R packages:**
```bash
R -e 'renv::snapshot()'
```

**Python packages:**
```bash
pip freeze > requirements.txt
```
