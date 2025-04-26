bin=../../node_modules/.bin/csv-generator
rows=(10 100 1K 10K 100K 500K 1M)
rows2=(920K)
cols="'name email ccnumber date 5 6 7 8 9 10'"

for i in "${rows2[@]}"; do
	echo "Generating file with $i rows"
	$bin data/${i}r_10c.csv -r $i 'name email ccnumber date 5 6 7 8 9 10'
done
