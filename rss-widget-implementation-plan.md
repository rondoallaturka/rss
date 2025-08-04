# RSS Article Widget Implementation Plan

## **Project Overview**
Create a custom HTML widget to replace CommonNinja RSS feed component for Latinometrics Carrd website.

## **Technical Specifications**

### **Data Source**
- **API Endpoint**: `https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Frss.beehiiv.com%2Ffeeds%2Fon4ViAZgs5.xml`
- **Rate Limit**: 10,000 requests/day (free tier)
- **Update Frequency**: Cache for 30 minutes to optimize API usage

### **Typography Requirements**
- **Headlines**: Lora font family
- **Body Text**: Lexend Deca font family
- **Font Loading**: Include Google Fonts via CSS import

### **Widget Structure**
```html
<div id="latinometrics-articles">
  <div class="article-card">
    <img class="article-thumbnail" />
    <div class="article-content">
      <h3 class="article-title"></h3>
      <p class="article-date"></p>
      <p class="article-description"></p>
      <a class="read-more-btn"></a>
    </div>
  </div>
</div>
```

### **Core Functionality**
- Display 6 most recent articles
- Truncate descriptions to 120 characters
- Format dates as "MMM DD, YYYY"
- Open links in new tab
- Loading state with skeleton placeholders
- Error handling for API failures

### **Responsive Design**
- **Desktop**: 3 columns grid layout
- **Tablet**: 2 columns grid layout  
- **Mobile**: Single column stack
- **Breakpoints**: 768px (tablet), 480px (mobile)
- **Images**: Aspect ratio 16:9, lazy loading
- **Touch-friendly**: 44px minimum touch targets

### **Carrd Integration Requirements**
- **Single File**: All HTML, CSS, JavaScript in one embeddable file
- **No External Dependencies**: Except Google Fonts and Tailwind CDN
- **Namespace CSS**: Use Tailwind classes to avoid conflicts
- **Container Width**: 100% responsive to parent container
- **Z-index**: Stay below 1000 to avoid Carrd conflicts

## **Development Deliverables**

### **Phase 1: Core Development (Updated for Tailwind)**
1. **HTML Structure** - Semantic markup with accessibility
2. **Tailwind CSS Integration** - Responsive grid, custom fonts, animations
3. **JavaScript Logic** - API integration, DOM manipulation
4. **Error Handling** - Fallback content, retry mechanisms

### **Phase 2: Testing & Optimization**
1. **Cross-browser Testing** - Chrome, Firefox, Safari, Edge
2. **Mobile Testing** - iOS Safari, Android Chrome
3. **Performance Testing** - Load times, API response handling
4. **Carrd Integration Testing** - Embed component compatibility

### **Phase 3: Deployment**
1. **Production File** - Single HTML file with Tailwind CDN
2. **Documentation** - Implementation guide for Carrd
3. **Backup Plan** - Static fallback if API fails

## **Tailwind Implementation Guide**

### **Step-by-Step Instructions**

#### **Step 1: Update HTML Head Section**
Replace the current `<head>` section with Tailwind CDN and custom configuration:
```html
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
            animation: {
              'shimmer': 'shimmer 1.5s infinite',
            },
            keyframes: {
              shimmer: {
                '0%': { backgroundPosition: '200% 0' },
                '100%': { backgroundPosition: '-200% 0' }
              }
            }
          }
        }
      }
    </script>
</head>
```

#### **Step 2: Remove All Custom CSS**
Delete the entire `<style>` section and replace with Tailwind classes.

#### **Step 3: Update Main Container**
```html
<div id="latinometrics-articles" class="font-lexend max-w-7xl mx-auto p-5" role="region" aria-label="Latest Articles">
```

#### **Step 4: Update Loading State Grid**
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="lm-loading-state">
```

#### **Step 5: Update Loading Skeleton Cards**
Replace each skeleton card with Tailwind classes:
```html
<div class="bg-white rounded-xl overflow-hidden shadow-lg flex flex-col h-full">
    <div class="w-full h-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]"></div>
    <div class="p-5 flex flex-col flex-1">
        <div class="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded mb-2"></div>
        <div class="h-4 w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded mb-3"></div>
        <div class="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded mb-2"></div>
        <div class="h-4 w-3/5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded mb-4"></div>
        <div class="h-11 w-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded-lg mt-auto"></div>
    </div>
</div>
```

#### **Step 6: Update Error State**
```html
<div class="text-center py-20 px-5" id="lm-error-state" style="display: none;">
    <div class="text-6xl mb-4 opacity-50">📰</div>
    <div class="text-lg text-gray-600 mb-4">Unable to load articles at this time</div>
    <button class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-300 min-h-[44px]" onclick="loadArticles()">Try Again</button>
</div>
```

#### **Step 7: Update Articles Container**
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="lm-articles-container" style="display: none;"></div>
```

#### **Step 8: Update JavaScript createArticleCard Function**
Replace with Tailwind classes:
```javascript
function createArticleCard(article) {
    const card = document.createElement('article');
    card.className = 'bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full';
    card.setAttribute('role', 'article');

    const thumbnail = document.createElement('img');
    thumbnail.className = 'w-full h-48 object-cover aspect-video';
    thumbnail.src = article.thumbnail || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjE2MCIgeT0iOTAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2Ugbm90IGF2YWlsYWJsZTwvdGV4dD4KPC9zdmc+';
    thumbnail.alt = article.title || 'Article thumbnail';
    thumbnail.loading = 'lazy';

    const content = document.createElement('div');
    content.className = 'p-5 flex flex-col flex-1';

    const title = document.createElement('h3');
    title.className = 'font-lora font-semibold text-xl leading-tight text-gray-900 mb-2 line-clamp-2';
    title.textContent = article.title || 'Untitled Article';

    const date = document.createElement('p');
    date.className = 'text-sm text-gray-600 mb-3 font-normal';
    date.textContent = formatDate(article.pubDate);

    const description = document.createElement('p');
    description.className = 'text-sm leading-relaxed text-gray-700 mb-4 flex-1 line-clamp-3';
    description.textContent = truncateText(article.description, CONFIG.maxDescriptionLength);

    const readMoreBtn = document.createElement('a');
    readMoreBtn.className = 'inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-300 min-h-[44px] self-start';
    readMoreBtn.href = article.link || '#';
    readMoreBtn.target = '_blank';
    readMoreBtn.rel = 'noopener noreferrer';
    readMoreBtn.textContent = 'Read More';
    readMoreBtn.setAttribute('aria-label', `Read full article: ${article.title}`);

    content.appendChild(title);
    content.appendChild(date);
    content.appendChild(description);
    content.appendChild(readMoreBtn);

    card.appendChild(thumbnail);
    card.appendChild(content);

    return card;
}
```

#### **Step 9: Update Display Functions**
```javascript
function showLoading() {
    elements.loadingState.style.display = 'grid';
    elements.errorState.style.display = 'none';
    elements.articlesContainer.style.display = 'none';
}

function showError() {
    elements.loadingState.style.display = 'none';
    elements.errorState.style.display = 'block';
    elements.articlesContainer.style.display = 'none';
}

function showArticles() {
    elements.loadingState.style.display = 'none';
    elements.errorState.style.display = 'none';
    elements.articlesContainer.style.display = 'grid';
}
```

## **Success Metrics**
- Load time: <2 seconds
- Mobile-friendly: 100% responsive
- API efficiency: <100 daily requests
- Zero conflicts with Carrd styling
- Reduced file size with Tailwind CDN

## **Implementation Notes**
- Use RSS2JSON API for cross-origin compatibility
- Implement caching to minimize API calls
- Ensure accessibility with proper ARIA labels
- Test thoroughly in Carrd's embed environment
- Provide fallback content for offline scenarios
- Tailwind CDN provides better performance and maintainability