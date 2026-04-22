#!/bin/bash

DASHBOARDS_DIR="$(dirname "$0")/grafana/dashboards"

echo "Downloading Grafana dashboards..."

# PostgreSQL — prometheuscommunity/postgres-exporter
curl -sL "https://grafana.com/api/dashboards/9628/revisions/7/download" \
  -o "$DASHBOARDS_DIR/postgresql.json"
echo "  ✓ PostgreSQL"

# Redis — oliver006/redis_exporter
curl -sL "https://grafana.com/api/dashboards/11835/revisions/1/download" \
  -o "$DASHBOARDS_DIR/redis.json"
echo "  ✓ Redis"

# k6 Load Testing Results
curl -sL "https://grafana.com/api/dashboards/2587/revisions/4/download" \
  -o "$DASHBOARDS_DIR/k6.json"
echo "  ✓ k6"

echo "Done. Run 'docker compose up -d' to start."
