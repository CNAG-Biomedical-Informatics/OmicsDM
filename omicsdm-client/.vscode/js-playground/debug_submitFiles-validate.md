# debug SubmitFiles.js - validate

Bug:
"File name already assigned"
gets triggered any time when you try to submit more then one row

## form cols example
```js
// edit this comment to trigger reload..

//How to copy formControls object from Chrome debugger to clipboard
//copy(JSON.stringify(formControls));
const formControls=[
    [
        {"id":"ExperimentID","index":0,"value":"t","valueIndex":{"value":0,"label":"t"},"error":""},
        {"id":"File","index":0,"value":["test.rds"],"error":""},
        {"id":"FileName","index":0,"value":"test.txt","error":""},
        {"id":"FileType","index":0,"value":"","error":""},
        {"id":"Platform","index":0,"value":[],"error":""}
    ],
    
    //figure out why below there are two times id=FileName
    //maybe this is the reason why "File name already assigned" gets triggered
    [
        {"id":"ExperimentID","index":1,"error":"","value":"t","valueIndex":{"value":0,"label":"t"}},{"id":"File","index":1,"error":"","value":["test.rds"]},
        {"id":"FileName","index":1,"error":"","value":"test.txt"},
        {"id":"FileType","index":1,"error":"","value":""},
        {"id":"Platform","index":1,"error":"","value":""},
        {"id":"FileName","index":1,"error":"","value":"test.txt"}
    ]
]


```

## get unique project ids
```js repl--
let projs= new Set();
formControls.forEach(function(col){
    projs.add(col.filter(col=>col.id==="ExperimentID")[0].value)
});

```

```js repl--
const valid_suffixes = [".tsv",".csv",".tx",".xlsx",".xls",".rds",".rda"];
validateSuffix = (fileName,valid_suffixes) => {
    
    let error_msg="File suffix not recognised. It must be one of the following: " + valid_suffixes

    let splitted = fileName.split(".");
    if( splitted.length === 1 || ( splitted[0] === "" && splitted.length === 2 ) ) {
    } else {
      if (valid_suffixes.includes("."+splitted.pop().toLowerCase())){
        error_msg = ""
      }
    }
    return error_msg
  }
let suffix = validateSuffix("test",valid_suffixes)

```

```js repl--
// edit this comment to trigger reload
error_msg="";
projs.forEach(function(p){
      filenames=[]

      // https://masteringjs.io/tutorials/fundamentals/filter-array-of-objects
      formControls.forEach(function(col){
        if (col.filter(col=>col.id === "ExperimentID")[0].value === p){
            let fileName=col.filter(col=>col.id==="File")[0].value[0];
            
            //check file suffix
            error_msg=this.validateSuffix(fileName,valid_suffixes);
            
            //check for duplicated filenames
            if (filenames.includes(fileName)){
                error_msg="File name already assigned"
            } else {
                filenames.push(fileName)
            }
            col.find(col=>col.id==="File").error = error_msg
        }
      })
})



```