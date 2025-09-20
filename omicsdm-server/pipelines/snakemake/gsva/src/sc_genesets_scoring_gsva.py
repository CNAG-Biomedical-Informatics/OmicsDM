#!/usr/bin/env python3
import argparse
import os
import scanpy as sc
import pandas as pd
from scipy.sparse import issparse
# from skmisc.loess import loess
import shutil


# R interface imports
import rpy2.robjects as ro
from rpy2.robjects.packages import importr

# TODO
# Try to run evything at once 


def compute_gsva(adata_filtered, gmt_path, tmp_dir='tmp'):
    """Run GSVA via R (escape) and return DataFrame of scores."""
    # write matrix and labels
    os.makedirs(tmp_dir, exist_ok=True)
    X = adata_filtered.X
    if not issparse(X):
        from scipy.sparse import csr_matrix
        X = csr_matrix(X)
    from scipy.io import mmwrite
    mmwrite(os.path.join(tmp_dir, 'matrix.mtx'), X)
    pd.Series(adata_filtered.obs_names).to_csv(
        os.path.join(tmp_dir, 'barcodes.tsv'),
        sep='\t', index=False, header=False
    )
    pd.Series(adata_filtered.var_names).to_csv(
        os.path.join(tmp_dir, 'genes.tsv'),
        sep='\t', index=False, header=False
    )

    # Load R packages
    r = ro.r
    # load packages
    importr('base')
    importr('Matrix')
    importr('escape')
    importr('clusterProfiler')

    # run GSVA
    r(f"""
    mat <- as.matrix(readMM('{tmp_dir}/matrix.mtx'))
    bar <- read.delim('{tmp_dir}/barcodes.tsv', header=FALSE)
    genes <- read.delim('{tmp_dir}/genes.tsv', header=FALSE)
    rownames(mat) <- bar$V1; colnames(mat) <- genes$V1
    mat <- t(as(mat, 'CsparseMatrix'))
    gmt <- read.gmt('{gmt_path}')
    GS <- split(gmt$gene, gmt$term)
    scores <- escape::escape.matrix(mat, method='GSVA', gene.sets=GS, min.size=5, groups=1000)
    write.csv(scores, file='{tmp_dir}/scores.csv', quote=FALSE)
    """)
    df = pd.read_csv(os.path.join(tmp_dir, 'scores.csv'), index_col=0)
    shutil.rmtree(tmp_dir)
    return df


def main():
    parser = argparse.ArgumentParser(description='score with gsva.')
    parser.add_argument('--path', required=True, help='Input .h5ad file')
    parser.add_argument('--gene_sets', required=True, help='GMT file of gene sets')
    parser.add_argument('--out_dir', default='.')
    args = parser.parse_args()

    os.makedirs(args.out_dir, exist_ok=True)
    adata = sc.read_h5ad(args.path)
    scores_df = compute_gsva(adata, args.gene_sets)

    adata.obs = adata.obs.join(scores_df)
    # base = os.path.splitext(os.path.basename(args.path))[0]
    # out_file = os.path.join(args.out_dir, f"{base}_scored.h5ad")
    out_file = os.path.join(args.out_dir, "gsva-scored.h5ad")
    adata.write(out_file)
    print('Saved scored AnnData to', out_file)


if __name__ == '__main__':
    main()
