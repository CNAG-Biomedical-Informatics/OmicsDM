
: '
Split a combined metadata+counts CSV file into:
  1. INFO_*.csv    → metadata (sample, Age, Gender, Group)
  2. COUNTS_*.csv → gene expression counts with genes as rows, samples as columns

Input format (example):
"","Age","Gender","Group","EEF1A1","CD74"
"32150756",54,"Female","CTRL",182010.83,72
"32150762",38,"Female","CTRL",269400.45,75
...

Steps:
- Extract sample metadata (first 4 columns) → INFO_*.csv
- Extract count matrix (sample IDs vs genes) → counts_wide_*.csv
- Transpose counts so it matches the by DESeq2 expected layout 
  (rows=genes, columns=samples) → COUNTS_*.csv

Usage:
  bash prepare_deseq2_input.sh all_samples.csv

Dependencies:
  - awk (POSIX)
  - csvtk (https://bioinf.shenwei.me/csvtk/) for fast transpose
'

IN="$1"
BASENAME=$(basename "$IN" .csv)

# 1. extract sample info
awk -F, 'BEGIN{OFS=" "}
  NR==1 { $1="BARCODE" }        # fix empty header
  { 
    for (i=1; i<=4; i++) {
      gsub(/"/, "", $i)        # remove quotes
    }
    print $1,$2,$3,$4 
  }' "$IN" > "INFO_${BASENAME}.csv"

# 2. extract wide counts (samples as rows, genes as columns)
awk -F, 'BEGIN{OFS=","}
  NR==1 { $1="\"gene_name\"" }
  {
    printf "%s",$1
    for (i=5;i<=NF;i++) printf "%s%s",OFS,$i
    printf "\n"
  }' "$IN" > counts_wide.csv

# 3. transpose so genes are rows (DESeq2 style)
csvtk transpose -H counts_wide.csv | tr ',' ' ' > "COUNTS_${BASENAME}.csv"

# clean up temporary file
rm counts_wide.csv