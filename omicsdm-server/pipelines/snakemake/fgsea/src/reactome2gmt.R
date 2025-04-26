print("---R-logs---")
print("start reactome2gmt.R")
print("start loading libs")
libs <- c("tidyverse")
for (lib in libs) {
  print(lib)
  suppressPackageStartupMessages(library(lib, character.only = TRUE))
}
print("libs loaded")

header <- c("X1", "X2", "X3", "X4", "X5", "X6")
res1 <- read_tsv("out/tmp/Ensembl2Reactome_All_Levels.txt")

# resource is read in with first row as header so preserve it in a variable
first_row <- names(res1)

# set a new header
names(res1) <- header

# create a named vector for inserting it in the tibble
names(first_row) <- header

# test to seed if add the former header back to the tibble worked
# t <- res1 %>%
#   bind_rows(first_row)  %>%
#   filter(X1 == "25677") %>%
#   filter(X2 == "R-BTA-1430728")
# print(t)

res1 %>%
  # add the former header back to the tibble
  bind_rows(first_row) %>%
  filter(X6 == "Homo sapiens") %>%
  select(c(X1, X4)) %>%
  mutate(X4 = str_replace_all(X4, " ", "_")) %>%
  group_by(X4) %>%
  summarise(ids = paste(X1, collapse = "\t")) %>%
  unite(result, X4, ids, sep = "\t") %>%
  pull(result) %>%
  write_lines("out/tmp/reactome_gmt.tsv")

print(res1)
