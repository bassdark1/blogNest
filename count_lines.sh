amount_in_public_dir=$(find ~/blognest/public/ -type f \( -name '*.js' -o -name '*.css' -o -name '*.html' \) | xargs cat | wc -l)
amount_in_index=$(wc -l ~/blognest/index.js | awk '{print $1}')
total=$((amount_in_public_dir + amount_in_index))
echo "There are" $total "total lines of code in the blognest project"
