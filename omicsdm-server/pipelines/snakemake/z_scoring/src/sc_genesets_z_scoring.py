#!/usr/bin/env python3
import argparse
import os
import scanpy as sc
import pandas as pd
from scipy.sparse import issparse
import numpy as np


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
    Z = temp.layers.get("cell_z", temp.X)
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


def main():
    parser = argparse.ArgumentParser(description="Z-scoring")
    parser.add_argument("--path", required=True, help="Input .h5ad file")
    parser.add_argument("--gene_sets", required=True, help="GMT file of gene sets")
    parser.add_argument("--out_dir", default=".")
    args = parser.parse_args()

    os.makedirs(args.out_dir, exist_ok=True)
    adata = sc.read_h5ad(args.path)
    gene_dict = load_gmt(args.gene_sets)
    scores_df = compute_zscores(adata, gene_dict)

    adata.obs = adata.obs.join(scores_df)
    # base = os.path.splitext(os.path.basename(args.path))[0]
    # out_file = os.path.join(args.out_dir, f"{base}_scored.h5ad")
    out_file = os.path.join(args.out_dir, "z-scored.h5ad")
    adata.write(out_file)
    print("Saved scored AnnData to", out_file)


if __name__ == "__main__":
    main()
