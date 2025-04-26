
## Generate files for manual data upload

### Requirements
https://github.com/atomicpages/csv-generator
https://www.npmjs.com/package/csv-generator

## Installation

### install:

```bash
npm i -D csv-generator 
```

### run:
```bash
./node_modules/.bin/generator-csv --help
```

### usage:
```bash
./node_modules/.bin/generator-csv test.csv -r 100K 'name email ccnumber date'
```

### script to generate mutiple csv files:
```
bash generateData.sh
```

#### output folder: data/