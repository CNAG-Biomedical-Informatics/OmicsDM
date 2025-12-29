Goal:
One docker container image that is able to run the entire pipeline

Bulk RNA-seq:

1. DESeq2
2. FGSEA (DESeq2 output as input)

Single-cell RNA-seq:

3. sc_normalisation

Use signifcant gene sets from FGSEA as input for:

4.a z_scoring
4.b gsva
