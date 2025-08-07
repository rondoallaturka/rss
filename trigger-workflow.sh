#!/bin/bash

# GitHub API script to trigger the RSS widget workflow
# Usage: ./trigger-workflow.sh [YOUR_GITHUB_TOKEN] (optional - will use .env if not provided)

# Load token from .env file if it exists and no argument provided
if [ -z "$1" ]; then
    if [ -f ".env" ]; then
        echo "📁 Loading token from .env file..."
        export $(cat .env | xargs)
        TOKEN="$GITHUB_TOKEN"
        if [ -z "$TOKEN" ]; then
            echo "❌ GITHUB_TOKEN not found in .env file"
            echo "Usage: $0 [YOUR_GITHUB_TOKEN]"
            echo ""
            echo "To get a token:"
            echo "1. Go to GitHub.com → Settings → Developer settings → Personal access tokens"
            echo "2. Generate new token (classic)"
            echo "3. Select 'repo' scope"
            echo "4. Copy the token and use it here"
            exit 1
        fi
    else
        echo "❌ No .env file found and no token provided"
        echo "Usage: $0 YOUR_GITHUB_TOKEN"
        echo ""
        echo "To get a token:"
        echo "1. Go to GitHub.com → Settings → Developer settings → Personal access tokens"
        echo "2. Generate new token (classic)"
        echo "3. Select 'repo' scope"
        echo "4. Copy the token and use it here"
        exit 1
    fi
else
    TOKEN="$1"
fi
REPO="rondoallaturka/rss"
WORKFLOW_FILE="update-rss.yml"

echo "🚀 Triggering GitHub Actions workflow..."
echo "Repository: $REPO"
echo "Workflow: $WORKFLOW_FILE"

response=$(curl -s -w "%{http_code}" -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token $TOKEN" \
  "https://api.github.com/repos/$REPO/actions/workflows/$WORKFLOW_FILE/dispatches" \
  -d '{"ref":"main"}')

http_code="${response: -3}"
response_body="${response%???}"

if [ "$http_code" = "204" ]; then
    echo "✅ Workflow triggered successfully!"
    echo "Check the Actions tab in your GitHub repository to see it running."
else
    echo "❌ Failed to trigger workflow"
    echo "HTTP Code: $http_code"
    echo "Response: $response_body"
fi 