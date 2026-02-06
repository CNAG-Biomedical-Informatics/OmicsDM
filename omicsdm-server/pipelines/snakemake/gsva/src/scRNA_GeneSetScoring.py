#!/usr/bin/env python3

# TODO
# ask Charisios if the GSVA and the Z-scores
# could also be used for bulk RNA-seq data?

import argparse
import os
import scanpy as sc
import pandas as pd
import numpy as np
import anndata
from scipy.sparse import issparse
# from skmisc.loess import loess
import shutil

# R interface imports
import rpy2.robjects as ro
from rpy2.robjects.packages import importr

def str2bool(v):
    """Convert a string to boolean."""
    if isinstance(v, bool):
        return v
    val = v.lower()
    if val in ('yes', 'true', 't', 'y', '1'):
        return True
    if val in ('no', 'false', 'f', 'n', '0'):
        return False
    raise argparse.ArgumentTypeError('Boolean value expected.')

def load_gmt(filename):
    """Load a GMT file into a dict: {gene_set: [genes]}"""
    gene_dict = {}
    with open(filename) as f:
        for line in f:
            parts = line.strip().split("\t")
            name = parts[0]
            genes = parts[2:]
            gene_dict[name] = genes
    return gene_dict

def compute_zscores(adata_filtered, gene_dict):
    """Compute average Z-score per module and return a DataFrame."""
    # scale per cell
    temp = adata_filtered.copy().T
    sc.pp.scale(temp, zero_center=True)
    temp = temp.T
    Z = temp.layers.get('cell_z', temp.X)
    scores = {}
    varnames = list(temp.var_names)
    for module, genes in gene_dict.items():
        present = [g for g in genes if g in varnames]
        if not present:
            print(f"No genes found for module: {module}")
            continue
        idx = [varnames.index(g) for g in present]
        arr = Z[:, idx]
        if issparse(arr):
            arr = arr.todense()
        arr = np.array(arr)
        scores[module] = arr.mean(axis=1)
        print(f"Z-score module '{module}' done")
    df = pd.DataFrame(scores, index=temp.obs_names)
    return df

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
    pd.Series(adata_filtered.obs_names).to_csv(os.path.join(tmp_dir,'barcodes.tsv'), sep='\t', index=False, header=False)
    pd.Series(adata_filtered.var_names).to_csv(os.path.join(tmp_dir,'genes.tsv'), sep='\t', index=False, header=False)

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
    df = pd.read_csv(os.path.join(tmp_dir,'scores.csv'), index_col=0)
    shutil.rmtree(tmp_dir)
    return df

def main():
    parser = argparse.ArgumentParser(description='Compute module scores from scRNA data.')
    parser.add_argument('--path', required=True, help='Input .h5ad file')
    parser.add_argument('--gene_sets', required=True, help='GMT file of gene sets')
    parser.add_argument('--method', choices=['Zscores','GSVA'], required=True)
    parser.add_argument('--out_dir', default='.')
    args = parser.parse_args()

    os.makedirs(args.out_dir, exist_ok=True)
    gene_dict = load_gmt(args.gene_sets)
    adata = sc.read_h5ad(args.path)

    # prepare filtered adata
    raw_counts = adata.raw.X.copy()
    adata_filtered = anndata.AnnData(X=raw_counts, obs=adata.obs.copy(), var=adata.raw.var.copy())
    adata_filtered.obs_names = adata.obs_names
    adata_filtered.var_names = adata.raw.var_names
    sc.pp.filter_genes(adata_filtered, min_cells=1, inplace=True)
    sc.pp.normalize_total(adata_filtered, target_sum=1e4)
    sc.pp.log1p(adata_filtered)

    if args.method == 'Zscores':
        scores_df = compute_zscores(adata_filtered, gene_dict)
    else:
        scores_df = compute_gsva(adata_filtered, args.gene_sets)

    adata.obs = adata.obs.join(scores_df)
    base = os.path.splitext(os.path.basename(args.path))[0]
    out_file = os.path.join(args.out_dir, f"{base}_scored.h5ad")
    adata.write(out_file)
    print('Saved scored AnnData to', out_file)

if __name__ == '__main__':
    main()
