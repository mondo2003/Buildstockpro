#!/bin/bash

# Direct Supabase API deployment
PROJECT_REF="xrhlumtimbmglzrfrnnk"
FUNCTION_NAME="search"
ACCESS_TOKEN="sbp_c5655a4b865cb74936186039ba60eb75e0cacc43"

echo "Getting function metadata..."

# Get current function info
curl -X GET \
  "https://api.supabase.com/v1/projects/$PROJECT_REF/functions/$FUNCTION_NAME" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  2>&1

echo ""
echo "Creating/updating function..."

# Read function content
FUNCTION_CONTENT=$(cat supabase/functions/search/index.ts)

# Create/update function
curl -X POST \
  "https://api.supabase.com/v1/projects/$PROJECT_REF/functions" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$FUNCTION_NAME\",
    \"verify_jwt\": false
  }" \
  2>&1

echo ""
echo "Done. Note: This may not update the code - need to use CLI for full deployment"
