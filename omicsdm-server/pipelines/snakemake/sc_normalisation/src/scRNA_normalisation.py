#!/usr/bin/env python3
import argparse
import os
import scanpy as sc
import anndata
from scipy.sparse import issparse
import numpy as np


def main():
    parser = argparse.ArgumentParser(description='normalise scRNA data.')
    parser.add_argument('--path', required=True, help='Input .h5ad file')
    parser.add_argument('--out_dir', default='.')
    args = parser.parse_args()

    os.makedirs(args.out_dir, exist_ok=True)
    adata = sc.read_h5ad(args.path)

    # prepare filtered adata
    raw_counts = adata.raw.X.copy()
    adata_filtered = anndata.AnnData(
        X=raw_counts, 
        obs=adata.obs.copy(), 
        var=adata.raw.var.copy()
    )
    adata_filtered.obs_names = adata.obs_names
    adata_filtered.var_names = adata.raw.var_names
    sc.pp.filter_genes(adata_filtered, min_cells=1, inplace=True)
    sc.pp.normalize_total(adata_filtered, target_sum=1e4) # target_sum should not be hardcoded
    sc.pp.log1p(adata_filtered)

    # if issparse(adata_filtered.X):
    #     # materialize to dense; downcast to float32 to keep size reasonable
    #     print("Converting to dense matrix")
    #     adata_filtered.X = adata_filtered.X.toarray().astype(np.float32)

    # out_file = os.path.join(args.out_dir, f"{base}_normalised.h5ad")
    out_file = os.path.join(args.out_dir, "normalised.h5ad")
    adata_filtered.write(out_file)
    print('Saved normalised AnnData to', out_file)


if __name__ == '__main__':
    main()
