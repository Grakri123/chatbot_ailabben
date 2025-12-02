# 🤖 AI Chatbot Assistant

En komplett, produksjonsklar AI-chatassistent for KL Varme AS som kan embeddes på nettsider. Bygget med Mistral AI (GDPR-vennlig) og deploybar på Vercel eller som standalone Node.js server. Forenklet arkitektur uten database - én instans per kunde.

## ✨ Funksjoner

- **🎯 Embed-vennlig**: Enkel å integrere med bare noen få linjer kode
- **🧠 AI-drevet**: Bruker Mistral AI (GDPR-kompatibel europeisk AI)
- **🏢 KL Varme-spesialisert**: Hardkodet med KL Varme kundeservice-prompt
- **🎨 Responsiv design**: Fungerer perfekt på desktop og mobil
- **⚡ Enkel deployment**: Ingen database nødvendig - kun Mistral API
- **🔧 Lett å tilpasse**: Endre prompt og design i dedikerte filer
- **📈 Skalerbar**: Én instans per kunde for optimal ytelse

## 🔧 Tilpasse Chatbot-oppførsel

### **📝 Endre AI System Prompt**
For å endre hvordan chatbotten oppfører seg, rediger filen:
```
src/config/prompt.js
```

Her kan du endre:
- **System prompt**: Chatbottens personlighet og oppførsel
- **AI-konfigurasjon**: Modell, temperatur, max tokens

### **🎨 Endre Utseende og Branding** 
For å endre farger, navn og tekster, rediger filen:
```
src/config/customer.js
```

Her kan du endre:
- **Firmanavn**: CUSTOMER_NAME
- **Widget-farger**: primaryColor
- **Velkommen-melding**: welcomeMessage
- **Avatar**: avatar-bokstaver

## 🚀 Kom i gang

### 1. Klon og installer

\`\`\`bash
git clone <repository-url>
cd ai-chatbot-assistant
npm install
\`\`\`

### 2. Konfigurer miljøvariabler

Kopier \`env.example\` til \`.env\` og fyll inn din Mistral API-nøkkel:

\`\`\`bash
cp env.example .env
\`\`\`

\`\`\`.env
# Mistral AI API (GDPR-vennlig europeisk AI)
MISTRAL_API_KEY=your-mistral-api-key-here

# App Configuration
NODE_ENV=development
PORT=3000
\`\`\`

**Hvor få Mistral API-nøkkel:**
1. Gå til https://console.mistral.ai
2. Opprett konto eller logg inn
3. API Keys → Create new key
4. Kopier nøkkelen (starter med `mr-...`)

### 3. Bygg widgeten

\`\`\`bash
npm run build:widget
\`\`\`

### 4. Test lokalt

\`\`\`bash
# Vercel dev server
npm run dev

# Eller Node.js server
npm start
\`\`\`

Åpne [http://localhost:3000/test.html](http://localhost:3000/test.html) for å teste widgeten.

## 🌐 Deployment

### Vercel (anbefalt)

1. **Koble til Vercel**:
   \`\`\`bash
   npm install -g vercel
   vercel login
   vercel
   \`\`\`

2. **Legg til miljøvariabler** i Vercel dashboard under Settings → Environment Variables

3. **Deploy**:
   \`\`\`bash
   npm run deploy
   \`\`\`

### Egen server

\`\`\`bash
# Bygg widgeten
npm run build:widget

# Start server
npm start
\`\`\`

Server kjører på port 3000 (eller \`PORT\` miljøvariabel).

## 💻 Bruk på nettsider

### Grunnleggende implementering

\`\`\`html
<!-- Legg til i <head> eller før </body> -->
<script src="https://chat.klvarme.no/widget.js"></script>
<script>
  KLChatbot.init(); // Ingen konfigurasjon nødvendig!
</script>
\`\`\`

### Avansert konfigurering

\`\`\`html
<script src="https://chat.klvarme.no/widget.js"></script>
<script>
  // Vent til siden er lastet
  document.addEventListener('DOMContentLoaded', function() {
    KLChatbot.init();
    
    // Åpne chatten automatisk etter 5 sekunder
    setTimeout(() => {
      KLChatbot.open();
    }, 5000);
  });
</script>
\`\`\`

### Deaktiver auto-initialisering

\`\`\`html
<script>
  window.KLCHAT_AUTO_INIT = false; // Sett før widget-script
</script>
<script src="https://chat.klvarme.no/widget.js"></script>
<script>
  // Initialiser manuelt senere
  KLChatbot.init();
</script>
\`\`\`

### Widget API

\`\`\`javascript
// Tilgjengelige metoder
KLChatbot.init();                             // Initialiser widget
KLChatbot.open();                             // Åpne chat
KLChatbot.close();                            // Lukk chat
KLChatbot.toggle();                           // Veksle chat åpen/lukket
KLChatbot.isOpen();                           // Sjekk om chat er åpen
KLChatbot.getSessionId();                     // Hent session ID
KLChatbot.getChatHistory();                   // Hent chat-historikk
\`\`\`

## 🔧 Administrasjon

### Klone for ny kunde

Dette repoet er designet for **én kunde per repo**. Se `CLONE_GUIDE.md` for detaljert guide.

**Kort versjon:**
1. Klon repoet: `git clone <repo> chatbot-ny-kunde`
2. Endre kun `src/config/customer.js`:
   ```javascript
   CUSTOMER_ID: "ny-kunde-id"  // ← Endre kun dette
   ```
3. Legg til kunde i Supabase (kun første gang):
   ```sql
   INSERT INTO customers (customer_id, name, system_prompt, api_provider, model_name) 
   VALUES (
       'ny-kunde-id',
       'Ny Kunde AS',
       'Du er kundeservice for Ny Kunde AS...',
       'openai',
       'gpt-4o'
   );
   ```
4. Deploy til egen URL

### Legge til kunde i eksisterende database

### Legge til FAQ

\`\`\`sql
INSERT INTO customer_faqs (customer_id, question, answer, priority)
VALUES (
    (SELECT id FROM customers WHERE customer_id = 'ny-kunde'),
    'Hva er åpningstidene?',
    'Vi er åpne mandag til fredag 09:00-17:00.',
    5
);
\`\`\`

### Legge til sidespesifikk kontekst

\`\`\`sql
INSERT INTO page_contexts (customer_id, url_pattern, context_title, context_data)
VALUES (
    (SELECT id FROM customers WHERE customer_id = 'ny-kunde'),
    '/produkter/*',
    'Produktinformasjon',
    'Her finner du informasjon om våre produkter...'
);
\`\`\`

## 📊 API Endpoints

### POST /api/chat
Send chat-melding og motta AI-respons.

\`\`\`json
{
  "message": "Hva koster en varmepumpe?",
  "current_url": "/produkter/varmepumper",
  "session_id": "chat_123456",
  "chat_history": []
}
\`\`\`

### GET /api/config
Hent kundekonfigurasjon for widget (customer_id hentes fra backend-config).

\`\`\`
/api/config
\`\`\`

### GET /api/health
Sjekk systemstatus.

\`\`\`json
{
  "success": true,
  "data": {
    "status": "healthy",
    "services": {
      "database": "healthy",
      "openai": "configured",
      "mistral": "configured"
    }
  }
}
\`\`\`

## 🗄️ Database-struktur

### Hovedtabeller

- **customers**: Kundekonfigurasjon og AI-innstillinger
- **customer_faqs**: FAQ per kunde med URL-patterns
- **page_contexts**: Sidespesifikk kontekst
- **chat_logs**: Alle samtaler med metadata
- **vector_chunks**: For framtidig embedding-search (valgfritt)

Se \`database/schema.sql\` for komplett struktur.

## 🎨 Tilpasning

### Widget-styling

Rediger \`src/widget/styles.css\` og bygg på nytt:

\`\`\`bash
npm run build:widget
\`\`\`

### CSS-variabler

\`\`\`css
.klchat-widget {
  --klchat-primary: #2563eb;        /* Hovedfarge */
  --klchat-primary-hover: #1d4ed8;  /* Hover-farge */
  --klchat-background: #ffffff;     /* Bakgrunn */
  --klchat-text: #1e293b;          /* Tekstfarge */
}
\`\`\`

## 🔒 Sikkerhet

- **Rate limiting**: 20 forespørsler per minutt per IP
- **Input sanitization**: Alle brukerinndata saniteres
- **CORS**: Konfigurert for sikker cross-origin bruk
- **API-nøkler**: Lagres sikkert som miljøvariabler
- **SQL injection**: Beskyttet med parameteriserte spørringer

## 📈 Overvåking

### Logging

Alle samtaler logges automatisk med:
- Kunde-ID og session-ID
- Brukermelding og AI-respons
- URL og metadata (IP, user agent)
- Responstid og token-bruk

### Health check

Overvåk systemet med:
\`\`\`bash
curl https://chat.klvarme.no/api/health
\`\`\`

## 🛠️ Utvikling

### Mappestruktur

\`\`\`
├── api/                 # Vercel serverless functions
│   ├── chat.js         # Chat API handler
│   ├── config.js       # Konfigurasjon API
│   └── health.js       # Health check
├── src/
│   ├── lib/            # Backend biblioteker
│   │   ├── supabase.js # Database service
│   │   ├── openai.js   # OpenAI integration
│   │   ├── mistral.js  # Mistral integration
│   │   └── utils.js    # Hjelpefunksjoner
│   └── widget/         # Frontend widget
│       ├── index.js    # Widget JavaScript
│       └── styles.css  # Widget CSS
├── database/
│   └── schema.sql      # Database schema
├── build/
│   └── build-widget.js # Widget build script
├── public/             # Statiske filer
└── scripts/
    └── setup-database.js # Database setup
\`\`\`

### Kommandoer

\`\`\`bash
npm run dev           # Start dev server (Vercel)
npm start            # Start Node.js server
npm run build:widget # Bygg widget
npm run deploy       # Deploy til Vercel
npm run db:setup     # Sett opp database
\`\`\`

## 🤝 Bidrag

1. Fork prosjektet
2. Opprett en feature branch
3. Commit endringene dine
4. Push til branchen
5. Åpne en Pull Request

## 📄 Lisens

MIT License - se LICENSE-filen for detaljer.

## 🆘 Support

- **Issues**: Opprett en issue på GitHub
- **Email**: [din-email@domain.no]
- **Dokumentasjon**: Se denne README-en

## 🚀 Neste steg

- [ ] Legg til vector search for større kunnskapsbaser
- [ ] Implementer chat-eksport funksjonalitet
- [ ] Legg til støtte for filer og bilder
- [ ] Bygg admin dashboard
- [ ] Legg til analytics og rapporter
- [ ] Støtte for flere språk

---

**Bygget med ❤️ av Informativ Reklame**
