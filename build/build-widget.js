// Build script to combine CSS and JS into a single widget file
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, '..', 'src', 'widget');
const publicDir = path.join(__dirname, '..', 'public');
const outputFile = path.join(publicDir, 'widget.js');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Read CSS file
const cssPath = path.join(srcDir, 'styles.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

// Read JS file
const jsPath = path.join(srcDir, 'index.js');
const jsContent = fs.readFileSync(jsPath, 'utf8');

// Create combined widget file
const widgetContent = `
// AI Labben Chatbot Widget v2.0.1
// Auto-generated file - do not edit directly
// Generated: ${new Date().toISOString()}

// Expose build version for debugging
(function(){ try { window.KLCHAT_WIDGET_VERSION = 'v2.0.1-${new Date().toISOString()}'; } catch(e){} })();

// Inject CSS
(function() {
  'use strict';
  
  // Check if styles are already injected
  if (document.getElementById('klchat-widget-styles')) {
    return;
  }
  
  const style = document.createElement('style');
  style.id = 'klchat-widget-styles';
  style.textContent = \`${cssContent.replace(/`/g, '\\`')}\`;
  document.head.appendChild(style);
})();

// Widget JavaScript
${jsContent}
`;

// Write the combined file
fs.writeFileSync(outputFile, widgetContent, 'utf8');

console.log('✅ Widget built successfully!');
console.log(`📦 Output: ${outputFile}`);
console.log(`📏 Size: ${(widgetContent.length / 1024).toFixed(2)}KB`);

// Create a simple HTML test file
const testHtmlContent = `<!DOCTYPE html>
<html lang="no">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Labben Chatbot Widget Test</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 40px;
            background: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333;
            margin-bottom: 20px;
        }
        .info {
            background: #e3f2fd;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        code {
            background: #f5f5f5;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Monaco', 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 AI Labben Chatbot Widget Test</h1>
        
        <div class="info">
            <h3>Test Instruks</h3>
            <p>Denne siden tester chatbot-widgeten med <code>ailabben</code> som customer_id.</p>
            <p>Widgeten skal vises som en lilla knapp nederst til høyre på siden.</p>
            <p>Klikk på knappen for å åpne chatten og test funksjonaliteten.</p>
        </div>
        
        <h2>Widget Implementation</h2>
        <p>For å bruke widgeten på din egen side, legg til følgende kode:</p>
        
        <pre><code>&lt;script src="http://localhost:3000/widget.js"&gt;&lt;/script&gt;
&lt;script&gt;
  KLChatbot.init(); // Ingen konfigurasjon nødvendig!
&lt;/script&gt;</code></pre>
        
        <h2>API Endpoints</h2>
        <ul>
            <li><strong>POST /api/chat</strong> - Send chat message</li>
            <li><strong>GET /api/config</strong> - Get customer configuration</li>
            <li><strong>GET /api/health</strong> - Health check</li>
        </ul>
        
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        
        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
    </div>

    <!-- Load the widget -->
    <script src="./widget.js"></script>
    <script>
        // Initialize (no config needed - customer_id is hardcoded in backend)
        KLChatbot.init();
        
        // Log widget API for testing
        console.log('KLChatbot API:', window.KLChatbot);
    </script>
</body>
</html>`;

const testHtmlFile = path.join(publicDir, 'test.html');
fs.writeFileSync(testHtmlFile, testHtmlContent, 'utf8');

console.log(`🧪 Test file: ${testHtmlFile}`);
console.log('\n🚀 Ready for deployment!');
