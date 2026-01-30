#!/bin/bash

# Deploy Search Edge Function to Supabase
# Usage: ./deploy-search.sh

PROJECT_REF="xrhlumtimbmglzrfrnnk"
FUNCTION_NAME="search"
ACCESS_TOKEN="sbp_c5655a4b865cb74936186039ba60eb75e0cacc43"

echo "Deploying $FUNCTION_NAME function to project $PROJECT_REF..."

# Read the function content
FUNCTION_FILE="supabase/functions/$FUNCTION_NAME/index.ts"

if [ ! -f "$FUNCTION_FILE" ]; then
    echo "Error: Function file not found: $FUNCTION_FILE"
    exit 1
fi

# Try to deploy using Supabase CLI
cd /Users/macbook/Desktop/buildstock.pro
~/supabase functions deploy $FUNCTION_NAME \
  --project-ref $PROJECT_REF \
  --no-verify-jwt

echo "Deployment complete!"
echo "Test with: curl -X GET 'https://$PROJECT_REF.supabase.co/functions/v1/$FUNCTION_NAME?query=cement' -H 'Authorization: Bearer YOUR_ANON_KEY'"
