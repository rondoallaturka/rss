#!/bin/bash

# Test GitHub token validity and permissions
# Usage: ./test-token.sh [YOUR_GITHUB_TOKEN] (optional - will use .env if not provided)

# Load token from .env file if it exists and no argument provided
if [ -z "$1" ]; then
    if [ -f ".env" ]; then
        echo "📁 Loading token from .env file..."
        export $(cat .env | xargs)
        TOKEN="$GITHUB_TOKEN"
        if [ -z "$TOKEN" ]; then
            echo "❌ GITHUB_TOKEN not found in .env file"
            echo "Usage: $0 [YOUR_GITHUB_TOKEN]"
            exit 1
        fi
    else
        echo "❌ No .env file found and no token provided"
        echo "Usage: $0 YOUR_GITHUB_TOKEN"
        exit 1
    fi
else
    TOKEN="$1"
fi
REPO="rondoallaturka/rss"

echo "🔍 Testing GitHub token..."
echo "Token starts with: ${TOKEN:0:4}..."

# Test 1: Basic authentication
echo "1. Testing basic authentication..."
response=$(curl -s -w "%{http_code}" -H "Authorization: token $TOKEN" \
  "https://api.github.com/user")

http_code="${response: -3}"
response_body="${response%???}"

if [ "$http_code" = "200" ]; then
    echo "✅ Authentication successful!"
    username=$(echo "$response_body" | grep -o '"login":"[^"]*"' | cut -d'"' -f4)
    echo "   Logged in as: $username"
else
    echo "❌ Authentication failed (HTTP $http_code)"
    echo "   Response: $response_body"
    exit 1
fi

# Test 2: Repository access
echo "2. Testing repository access..."
response=$(curl -s -w "%{http_code}" -H "Authorization: token $TOKEN" \
  "https://api.github.com/repos/$REPO")

http_code="${response: -3}"
response_body="${response%???}"

if [ "$http_code" = "200" ]; then
    echo "✅ Repository access successful!"
    repo_name=$(echo "$response_body" | grep -o '"full_name":"[^"]*"' | cut -d'"' -f4)
    echo "   Repository: $repo_name"
else
    echo "❌ Repository access failed (HTTP $http_code)"
    echo "   Response: $response_body"
    echo "   Make sure your token has 'repo' or 'public_repo' scope"
    exit 1
fi

# Test 3: Workflow access
echo "3. Testing workflow access..."
response=$(curl -s -w "%{http_code}" -H "Authorization: token $TOKEN" \
  "https://api.github.com/repos/$REPO/actions/workflows")

http_code="${response: -3}"
response_body="${response%???}"

if [ "$http_code" = "200" ]; then
    echo "✅ Workflow access successful!"
    workflow_count=$(echo "$response_body" | grep -o '"total_count":[0-9]*' | cut -d':' -f2)
    echo "   Found $workflow_count workflows"
else
    echo "❌ Workflow access failed (HTTP $http_code)"
    echo "   Response: $response_body"
    echo "   Make sure your token has 'repo' or 'public_repo' scope"
    exit 1
fi

echo ""
echo "🎉 All tests passed! Your token is valid and has the right permissions."
echo "You can now use: ./trigger-workflow.sh $TOKEN" 