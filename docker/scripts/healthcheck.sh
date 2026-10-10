#!/bin/bash
# RecallVET Health Check
SERVICES=("https://www.recallvet.com" "https://app.recallvet.com" "https://api.recallvet.com/api/public/plans")
ALERT_EMAIL="${SMTP_FROM:-noreply@recallvet.com}"
ALL_OK=true

for URL in "${SERVICES[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$URL")
  if [ "$STATUS" != "200" ]; then
    echo "ALERT: $URL returned HTTP $STATUS at $(date)"
    ALL_OK=false
  else
    echo "OK: $URL (HTTP $STATUS)"
  fi
done

if [ "$ALL_OK" = true ]; then
  echo "All services healthy at $(date)"
fi
