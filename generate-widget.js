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