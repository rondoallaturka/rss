# GitHub Actions Implementation Plan
## Optimized RSS Widget with Zero Client-Side API Calls

### Overview
This plan transforms the current client-side RSS widget into a server-side generated static widget using GitHub Actions. This eliminates redundant API calls from visitors and ensures optimal performance.

---

## Current Problem
- **Client-Side Fetching**: Each visitor's browser makes API calls
- **Redundant Requests**: Multiple visitors = multiple API calls for same data
- **API Quota Waste**: 10,000 daily limit shared across all visitors
- **Performance Impact**: Visitors wait for API responses

## Solution Benefits
- **Single Daily API Call**: GitHub Actions fetches RSS once per day
- **Zero Visitor API Calls**: Pre-built HTML served to all visitors
- **Instant Loading**: No JavaScript fetching, content is already in HTML
- **API Efficiency**: 99.6% reduction in API usage (365 calls/year vs 3,650+)
- **100% Free**: Uses GitHub's free Actions minutes

---

## Implementation Steps

### Step 1: Create GitHub Actions Workflow

**File**: `.github/workflows/update-rss.yml`

```yaml
name: Update RSS Widget Daily

on:
  schedule:
    # Run daily at 6:00 AM UTC (adjust timezone as needed)
    - cron: '0 6 * * *'
  workflow_dispatch: # Allow manual triggers

jobs:
  update-rss:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        
    - name: Fetch RSS and build widget
      run: |
        # Fetch RSS data from API
        curl -o rss-data.json "https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Frss.beehiiv.com%2Ffeeds%2Fon4ViAZgs5.xml"
        
        # Run Node.js script to generate HTML
        node generate-widget.js
        
    - name: Commit and push if changed
      run: |
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        git add widget-static.html
        git diff --staged --quiet || git commit -m "Auto-update RSS widget - $(date)"
        git push
```

### Step 2: Create Widget Generator Script

**File**: `generate-widget.js`

```javascript
const fs = require('fs');

// Read the fetched RSS data
const rssData = JSON.parse(fs.readFileSync('rss-data.json', 'utf8'));

// Widget HTML template
const widgetTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Latinometrics RSS Widget</title>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Lexend+Deca:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            fontFamily: {
              'lora': ['Lora', 'serif'],
              'lexend': ['Lexend Deca', 'sans-serif'],
            },
            colors: {
              'latinometrics': {
                'primary': '#384F7F',
                'secondary': '#FCF5ED',
                'card': '#EFEAE4',
                'text-primary': '#FCF5ED',
                'text-secondary': '#030712',
                'background': '#FCF5ED',
                'text-background': '#222222',
              }
            }
          }
        }
      }
    </script>
</head>
<body>
    <div id="latinometrics-articles" class="font-lexend max-w-7xl mx-auto p-5 bg-latinometrics-secondary min-h-screen" role="region" aria-label="Latest Articles">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {{ARTICLES_HTML}}
        </div>
    </div>
</body>
</html>`;

// Generate article HTML
function generateArticleHTML(articles) {
    return articles.slice(0, 6).map(article => {
        // Determine image handling
        let imageHtml = '';
        let isPremiumContent = false;
        
        if (article.enclosure && article.enclosure.link) {
            imageHtml = `<img class="w-full h-48 object-cover aspect-square" src="${article.enclosure.link}" alt="${article.title}" loading="lazy">`;
        } else if (article.thumbnail) {
            const genericImagePatterns = [
                /Domingo_Brief_Cover\.png/,
                /\/image\.png\?/
            ];
            const isGenericImage = genericImagePatterns.some(pattern => pattern.test(article.thumbnail));
            
            if (isGenericImage) {
                isPremiumContent = true;
                imageHtml = `
                    <div class="w-full h-48 bg-gradient-to-br from-latinometrics-primary via-latinometrics-primary to-latinometrics-primary/90 flex items-center justify-center relative overflow-hidden aspect-square">
                        <div class="absolute inset-0 opacity-10">
                            <svg class="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" stroke-width="0.5"/>
                                    </pattern>
                                </defs>
                                <rect width="100" height="100" fill="url(#grid)" />
                            </svg>
                        </div>
                        <div class="text-center text-white z-10 relative">
                            <div class="text-4xl mb-3">🔒</div>
                            <h3 class="text-lg font-semibold mb-2">Premium Content</h3>
                            <p class="text-sm opacity-90">Unlock exclusive charts & insights</p>
                        </div>
                    </div>`;
            } else {
                imageHtml = `<img class="w-full h-48 object-cover aspect-square" src="${article.thumbnail}" alt="${article.title}" loading="lazy">`;
            }
        } else {
            const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjE2MCIgeT0iOTAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2Ugbm90IGF2YWlsYWJsZTwvdGV4dD4KPC9zdmc+';
            imageHtml = `<img class="w-full h-48 object-cover aspect-video" src="${fallbackImage}" alt="Article thumbnail" loading="lazy">`;
        }
        
        // Format date
        const date = new Date(article.pubDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        // Truncate description
        const description = article.description && article.description.length > 120 
            ? article.description.substring(0, 120).trim() + '...'
            : article.description || '';
        
        // Button configuration
        const buttonHref = isPremiumContent ? 'https://mail.latinometrics.com/upgrade' : (article.link || '#');
        const buttonText = isPremiumContent ? 'Subscribe to Read' : 'Read More';
        const buttonClass = isPremiumContent 
            ? 'inline-flex items-center justify-center bg-latinometrics-primary hover:bg-latinometrics-primary/90 text-latinometrics-text-primary font-medium py-3 px-6 rounded-lg transition-all duration-300 min-h-[44px] self-start shadow-lg hover:shadow-xl'
            : 'inline-flex items-center justify-center bg-latinometrics-primary hover:bg-latinometrics-primary/90 text-latinometrics-text-primary font-medium py-3 px-6 rounded-lg transition-colors duration-300 min-h-[44px] self-start';
        
        return `
            <article class="bg-latinometrics-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full" role="article">
                ${imageHtml}
                <div class="p-5 flex flex-col flex-1">
                    <h3 class="font-lora font-semibold text-xl leading-tight text-latinometrics-text-background mb-2 line-clamp-2">${article.title || 'Untitled Article'}</h3>
                    <p class="text-sm text-gray-600 mb-3 font-normal">${date}</p>
                    <p class="text-sm leading-relaxed text-gray-700 mb-4 flex-1 line-clamp-3">${description}</p>
                    <a href="${buttonHref}" target="_blank" rel="noopener noreferrer" class="${buttonClass}" aria-label="${isPremiumContent ? 'Subscribe to read premium content' : `Read full article: ${article.title}`}">
                        ${buttonText}
                    </a>
                </div>
            </article>`;
    }).join('');
}

// Generate the complete HTML
const articlesHTML = generateArticleHTML(rssData.items || []);
const completeHTML = widgetTemplate.replace('{{ARTICLES_HTML}}', articlesHTML);

// Write the static widget file
fs.writeFileSync('widget-static.html', completeHTML);

console.log('✅ Static widget generated successfully!');
console.log(`📊 Generated ${rssData.items ? rssData.items.slice(0, 6).length : 0} articles`);
console.log(`🕒 Generated at: ${new Date().toISOString()}`);
```

### Step 3: Directory Structure

```
your-repo/
├── .github/
│   └── workflows/
│       └── update-rss.yml
├── generate-widget.js
├── widget-static.html (auto-generated)
├── rss-data.json (temporary, auto-generated)
└── README.md
```

---

## Configuration Options

### Scheduling
**Current**: Daily at 6:00 AM UTC
**Modify**: Change cron expression in workflow file
- `'0 6 * * *'` = 6:00 AM UTC daily
- `'0 14 * * *'` = 2:00 PM UTC daily
- `'0 6 * * 1-5'` = 6:00 AM UTC weekdays only

### Timezone Considerations
- GitHub Actions runs in UTC
- Adjust cron time based on your publishing schedule
- Consider your audience's timezone for optimal freshness

### Manual Triggers
- Workflow includes `workflow_dispatch` for manual runs
- Go to Actions tab → Select workflow → "Run workflow"
- Useful for testing or immediate updates

---

## Implementation Checklist

### Phase 1: Setup
- [ ] Create `.github/workflows/` directory
- [ ] Add `update-rss.yml` workflow file
- [ ] Create `generate-widget.js` script
- [ ] Test locally with Node.js

### Phase 2: GitHub Configuration
- [ ] Commit workflow files to repository
- [ ] Enable GitHub Actions (if not already enabled)
- [ ] Verify workflow permissions for repository writes
- [ ] Test manual workflow trigger

### Phase 3: Integration
- [ ] Update Carrd iframe to use `widget-static.html`
- [ ] Monitor first automated run
- [ ] Verify generated HTML content
- [ ] Test visitor experience (no loading delays)

### Phase 4: Optimization
- [ ] Adjust schedule timing if needed
- [ ] Monitor GitHub Actions usage (should be minimal)
- [ ] Add error handling/notifications if desired

---

## Monitoring & Maintenance

### GitHub Actions Dashboard
- View workflow runs at: `https://github.com/USERNAME/REPO/actions`
- Check for failed runs or errors
- Review generated commit messages

### Success Indicators
- ✅ Daily commits with "Auto-update RSS widget"
- ✅ `widget-static.html` file updates
- ✅ Carrd iframe loads instantly without shimmer
- ✅ Fresh content appears within 24 hours of publishing

### Troubleshooting
- **Workflow fails**: Check Actions logs for API errors
- **No updates**: Verify RSS feed hasn't changed
- **Permission errors**: Ensure Actions can write to repository

---

## Migration Plan

### Current State
```html
<!-- Current iframe (makes API calls) -->
<iframe src="https://rondoallaturka.github.io/rss/latinometrics-rss-widget-production.html">
```

### New State
```html
<!-- New iframe (static content) -->
<iframe src="https://rondoallaturka.github.io/rss/widget-static.html">
```

### Deployment Steps
1. Implement GitHub Actions workflow
2. Wait for first successful run
3. Update Carrd iframe URL
4. Archive old widget files (optional)

---

## Cost Analysis

### Current Client-Side Approach
- **API Calls**: 1,000-3,000+ per day (estimate)
- **GitHub Pages**: Free
- **Total Cost**: $0 (but inefficient)

### New GitHub Actions Approach
- **API Calls**: 365 per year (99.6% reduction)
- **GitHub Actions**: ~30 minutes/month (free tier: 2,000 minutes)
- **GitHub Pages**: Free
- **Total Cost**: $0 (and efficient)

---

## Success Metrics

### Performance
- **Load Time**: Instant (no API delays)
- **API Usage**: 1 call per day vs. hundreds
- **User Experience**: No loading shimmer

### Reliability
- **Uptime**: 100% (static files)
- **Cache Issues**: Eliminated
- **API Limits**: Never reached

---

## Next Steps

1. **Review Plan**: Ensure alignment with technical requirements
2. **Implement Workflow**: Create GitHub Actions files
3. **Test Locally**: Verify script works with sample data
4. **Deploy**: Commit workflow and test first run
5. **Switch**: Update Carrd iframe to new static file
6. **Monitor**: Watch for successful daily updates

---

*This implementation eliminates 99.6% of API calls while maintaining the same user experience with faster loading times.*