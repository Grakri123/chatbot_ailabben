#!/bin/bash

# KL VARME Chatbot - Fix og Deploy Script
# Dette scriptet sikrer at widget.js matcher test.html før deployment

set -e

echo "🔧 KL VARME Chatbot - Fix og Deploy"
echo "===================================="

# 1. Sjekk at vi er i riktig directory
if [ ! -f "package.json" ]; then
    echo "❌ Feil: Må kjøres fra prosjektets rot-directory"
    exit 1
fi

# 2. Sjekk at alle nødvendige filer eksisterer
echo "📋 Sjekker filer..."
required_files=(
    "src/widget/index.js"
    "src/widget/styles.css"
    "src/config/customer.js"
    "src/config/prompt.js"
    "build/build-widget.js"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Manglende fil: $file"
        exit 1
    fi
done

echo "✅ Alle filer funnet"

# 3. Installer dependencies
echo "📦 Installerer dependencies..."
npm install

# 4. Bygg widget på nytt
echo "🔨 Bygger widget..."
npm run build:widget

# 5. Verifiser at widget.js er bygget
if [ ! -f "public/widget.js" ]; then
    echo "❌ widget.js ble ikke bygget"
    exit 1
fi

widget_size=$(wc -c < "public/widget.js")
echo "✅ widget.js bygget (${widget_size} bytes)"

# 6. Test lokal server (optional)
echo "🧪 Vil du teste lokalt først? (y/N)"
read -r test_local

if [[ $test_local =~ ^[Yy]$ ]]; then
    echo "🚀 Starter lokal server..."
    echo "Åpne http://localhost:3000/test.html i nettleseren"
    echo "Trykk Ctrl+C for å stoppe serveren når du er ferdig med å teste"
    npm start
fi

# 7. Deploy til Vercel (hvis ønskelig)
echo "🌐 Vil du deploye til Vercel nå? (y/N)"
read -r deploy_vercel

if [[ $deploy_vercel =~ ^[Yy]$ ]]; then
    echo "🚀 Deployer til Vercel..."
    
    # Sjekk om Vercel CLI er installert
    if ! command -v vercel &> /dev/null; then
        echo "📥 Installerer Vercel CLI..."
        npm install -g vercel
    fi
    
    # Deploy
    vercel --prod
    
    echo "✅ Deployment fullført!"
    echo "🔗 Sjekk din Vercel dashboard for URL"
else
    echo "⏭️  Deployment hoppet over"
fi

# 8. Vis neste steg
echo ""
echo "🎉 Widget er klar!"
echo "============================"
echo "📁 Widget-filer:"
echo "   - public/widget.js (${widget_size} bytes)"
echo "   - public/widget.min.js"
echo ""
echo "🌐 For å bruke på kundens nettside:"
echo "   Se customer-widget-script.html for integrasjonskode"
echo ""
echo "🧪 Test lokalt:"
echo "   npm start"
echo "   Åpne http://localhost:3000/test.html"
echo ""
echo "✅ Ferdig!"
