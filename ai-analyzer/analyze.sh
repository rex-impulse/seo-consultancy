#!/bin/bash
# AI Analysis trigger - runs on the OpenClaw host
# Called by cron or manually to process completed audits

SUPA_URL="https://aodrdzptwrbxrgzpjmhp.supabase.co"
SUPA_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZHJkenB0d3JieHJnenBqbWhwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMyNDM0NSwiZXhwIjoyMDg2OTAwMzQ1fQ.LdI4IMcN5smeI_5u6xnZHoSg_mshKUOflmCBiTUIWvY"

# Find audits that are complete but don't have AI analysis yet
AUDITS=$(curl -s "${SUPA_URL}/rest/v1/audits?status=eq.complete&ai_analysis=is.null&select=id,url,full_data&limit=5" \
  -H "apikey: ${SUPA_KEY}" \
  -H "Authorization: Bearer ${SUPA_KEY}")

echo "$AUDITS" | jq -r '.[].id' | while read AUDIT_ID; do
  if [ -n "$AUDIT_ID" ] && [ "$AUDIT_ID" != "null" ]; then
    echo "Processing audit: $AUDIT_ID"
    # Mark as analyzing
    curl -s -X PATCH "${SUPA_URL}/rest/v1/audits?id=eq.${AUDIT_ID}" \
      -H "apikey: ${SUPA_KEY}" \
      -H "Authorization: Bearer ${SUPA_KEY}" \
      -H "Content-Type: application/json" \
      -H "Prefer: return=minimal" \
      -d '{"current_step": "AI analyzing your results..."}'
  fi
done

echo "Found audits to process: $(echo "$AUDITS" | jq length)"
