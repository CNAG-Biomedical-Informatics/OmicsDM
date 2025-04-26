# Process Input
current_dir <- getwd()
report_dir <- "out/"
report_index <- "index.Rmd"

# Print Messages to help debug
message("Going to build bookdown project")
message("Current Working Directory: ", current_dir)

## we need this so the build runs successfully,
## bookdown likes to run from the same directory as where the files located
message("Setting Working Directory to where paper is located: ", report_dir)
setwd(report_dir)

message("Building paper with bookdown")
bookdown::render_book(report_index, 'bookdown::html_document2')
