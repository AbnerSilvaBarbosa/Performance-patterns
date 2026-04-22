#!/bin/bash

K6_RESULTS_DIR="k6/results"

extract_metric() {
  local file=$1
  local metric=$2
  
  if [ ! -f "$file" ]; then
    echo ""
    return
  fi
  
  grep -o "\"metric\":\"$metric\"[^}]*}" "$file" 2>/dev/null | tail -1 | grep -o '"value":[0-9.]*' | sed 's/"value"://'
}

compare() {
  echo "======================================"
  echo "  K6 RESULTS COMPARISON"
  echo "======================================"
  echo ""
  printf "| Test      | Without Cache | With Cache | Improvement |\n"
  printf "|-----------|---------------|------------|-------------|\n"
  
  for test in smoke load stress spike; do
    wc_file="$K6_RESULTS_DIR/${test}-without-cache.json"
    cc_file="$K6_RESULTS_DIR/${test}-with-cache.json"
    
    wc_val=$(extract_metric "$wc_file" "http_req_duration")
    cc_val=$(extract_metric "$cc_file" "http_req_duration")
    
    if [ -n "$wc_val" ] && [ -n "$cc_val" ] && [ "$cc_val" != "0" ] && [ "$wc_val" != "0" ]; then
      imp=$(echo "$wc_val $cc_val" | awk '{if ($1 > 0) printf "%.1f", ($1 - $2) * 100 / $1; else print "0"}')
      printf "| %-9s | %11s ms | %9s ms | %9s%% |\n" "$test" "$wc_val" "$cc_val" "$imp"
    else
      printf "| %-9s | %11s | %9s | %9s |\n" "$test" "${wc_val:-N/A}" "${cc_val:-N/A}" "N/A"
    fi
  done
  
  echo ""
  echo "Exemplo de melhoria esperada:"
  echo "  - Response time: 30-70% menor com cache"
  echo "  - Throughput: 5-10x maior"
}

run_tests() {
  echo "Usage:"
  echo ""
  echo "1. WITHOUT-CACHE (rode primeiro):"
  echo "   nest start without-cache --watch"
  echo "   k6 run k6/load.js --out json=$K6_RESULTS_DIR/load-without-cache.json"
  echo ""
  echo "2. WITH-CACHE (rode depois):"
  echo "   nest start with-cache --watch"
  echo "   BASE_URL=http://localhost:3001 k6 run k6/load.js --out json=$K6_RESULTS_DIR/load-with-cache.json"
  echo ""
  echo "3. Compare:"
  echo "   ./k6/compare.sh compare"
  echo ""
}

if [ "$1" == "compare" ]; then
  compare
else
  run_tests
fi