const sampleData = {
  json: {
    // bulk RNA-seq base analysis
    deseq2: {
      report: "deseq2",
      analysis: "deseq2",
      files: {
        counts: "COUNTS_genes_TEST_134_135_summed.csv",
        info: "info_TEST_134_135.csv",
      },
      options: {
        profiling: "TRUE",
        onlypca: "FALSE",
        group: "GROUP",
        project: "TEST_134_135",
        control: "TEST_134_500",
        covariants: {},
        mod: "~group",
        contrast: {
          TEST_135_100_vs_TEST_135_500: "group,TEST_135_100,TEST_135_500",
          TEST_135_500_vs_TEST_134_500: "group,TEST_135_500,TEST_134_500",
          TEST_135_100_vs_TEST_134_500: "group,TEST_135_100,TEST_134_500",
        },
        plot: "TRUE",
        plot_atr: {
          pca: "group",
          heatmap_ann: "group",
          de_genes_n: 50,
        },
        bases_on: null,
      },
    },
    // bulk RNA-seq after deseq2 - option a
    getgo: {
      report: "getGO",
      analysis: "getgo",
      files: {},
      options: {
        profiling: "TRUE",
        bases_on: "deseq2",
      },
    },
    // bulk RNA-seq after deseq2 - option b
    fgsea: {
      report: "fgsea",
      analysis: "fgsea",
      files: {
        gmt: "c6.all.v2023.2.Hs.symbols.gmt", //MSigDB example
      },
      options: {
        profiling: "TRUE",
        bases_on: "deseq2",
        use_reactome_identifier_mapping_file: null,
      },
    },
    // scRNA-seq - after normalisation - option a
    "sc-normalisation": {
      report: "sc-normalisation",
      analysis: "sc-normalisation",
      files: {
        h5ad: "PerezRK_subset_pruned.h5ad",
      },
      options: {
        bases_on: null,
        target_sum: 1e4,
      },
    },
    // scRNA-seq - after normalisation - option b
    gsva: {
      report: "gsva",
      analysis: "gsva",

      // TODO
      // it should be possible to select multiple gmts (which should be merged)
      files: {
        h5ad: "PerezRK_subset_pruned.h5ad", //TODO better call the option "annData"
        gmt: "min.gmt", // 2 genesets from GO_BP_selected_subset.gmt
      },
      options: {
        bases_on: null,
        label_transfer_on_h5ad: "TRUE",
        // genesets_names_or_pattern: ["*B_CELL*"],

        // TODO
        // inform the user that at least two genesets are required
        genesets_names_or_pattern: [
          "GOBP_PRO_B_CELL_DIFFERENTIATION",
          "GOBP_NEGATIVE_REGULATION_OF_B_CELL_APOPTOTIC_PROCESS",
        ],
        gsea_pval_threshold: 0.05, // only applies when bases_on includes bulk_fgsea
        gsea_min_nes_threshold: 1, // only applies when bases_on includes bulk_fgsea
      },
    },
    // scRNA-seq - after normalisation - option b
    "z-scoring": {
      report: "z-scoring",
      analysis: "z-scoring",
      files: {
        h5ad: "PerezRK_subset_pruned.h5ad",
        gmt: "min.gmt", // 2 genesets from GO_BP_selected_subset.gmt
      },
      options: {
        bases_on: null,
        label_transfer_on_h5ad: "TRUE",
        // genesets_name_or_pattern: ["*B_CELL*"],
        genesets_name_or_pattern: [
          "GOBP_PRO_B_CELL_DIFFERENTIATION",
          "GOBP_NEGATIVE_REGULATION_OF_B_CELL_APOPTOTIC_PROCESS",
        ],
        gsea_pval_threshold: 0.05, //only applies when bases_on includes bulk_fgsea
        gsea_min_nes_threshold: 1, // only applies when bases_on includes bulk_fgsea
      },
    },
  },
};
export default sampleData;
