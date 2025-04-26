#!/bin/bash

n=$1
infn=$2
outfn=$3

echo > "$outfn"
for ((i=1;i<="$n";i++));do
        echo "$i"
        cat "$infn" >> "$outfn"; done
