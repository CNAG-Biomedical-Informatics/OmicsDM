const sampleData = {
  json: {
    deseq2: {
      report: "deseq2",
      analysis: "deseq2",
      files: {
        "counts": "COUNTS_genes_TEST_134_135_summed.csv",
        "info": "info_TEST_134_135.csv"
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
          "TEST_135_100_vs_TEST_135_500": "group,TEST_135_100,TEST_135_500",
          "TEST_135_500_vs_TEST_134_500": "group,TEST_135_500,TEST_134_500",
          "TEST_135_100_vs_TEST_134_500": "group,TEST_135_100,TEST_134_500"
        },
        plot: "TRUE",
        plot_atr: {
          "pca": "group",
          "heatmap_ann": "group",
          "de_genes_n": 50
        },
        bases_on: null,
      },
    },
    // option a
    getgo: {
      report: "getGO",
      analysis: "getgo",
      files: {},
      options: {
        profiling: "TRUE",
        bases_on: "deseq2",
      },
    },
    // option b
    fgsea: {
      report: "fgsea",
      analysis: "fgsea",
      files: {
        "gmt": "c6.all.v2023.2.Hs.symbols.gmt", //MSigDB example
      },
      options: {
        profiling: "TRUE",
        bases_on: "deseq2",
        use_reactome_identifier_mapping_file: null
      },
    },
  }
};
export default sampleData;
