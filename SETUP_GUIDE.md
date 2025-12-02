# 🚀 Steg-for-steg: Første implementering

Nøyaktig guide for å sette opp AI Labben chatbot-systemet fra bunnen av.

## 📋 Forutsetninger

- [ ] Node.js 18+ installert
- [ ] Git installert
- [ ] Mistral AI konto (https://console.mistral.ai)
- [ ] Supabase konto (https://supabase.com)
- [ ] Vercel konto (https://vercel.com) - valgfritt

## 🔧 Steg 1: Klon og installer

```bash
# Klon repoet
git clone <dette-repoet> kl-varme-chatbot
cd kl-varme-chatbot

# Installer avhengigheter
npm install
```

## 🔑 Steg 2: Sett opp Mistral AI (GDPR-vennlig)

1. **Gå til Mistral Console**: https://console.mistral.ai
2. **Opprett konto** eller logg inn
3. **Generer API-nøkkel**:
   - Gå til "API Keys" 
   - Klikk "Create new key"
   - Kopier nøkkelen (starter med `mr-...`)

## 🗄️ Steg 3: Sett opp Supabase database

1. **Opprett Supabase prosjekt**:
   - Gå til https://supabase.com
   - Klikk "New project"
   - Velg organisasjon og gi prosjekt et navn
   - Velg region (anbefalt: Europe West for GDPR)
   - Sett database-passord

2. **Hent Supabase-nøkler**:
   - Gå til Settings → API
   - Kopier:
     - Project URL
     - anon/public key
     - service_role key (secret!)

## ⚙️ Steg 4: Konfigurer miljøvariabler

```bash
# Kopier example-filen
cp env.example .env
```

Rediger `.env` med dine nøkler:

```bash
# Mistral AI API (GDPR-vennlig europeisk AI)
MISTRAL_API_KEY=mr-your-mistral-api-key-here

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App Configuration
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Widget Configuration
WIDGET_BASE_URL=https://chat.klvarme.no
```

## 🗃️ Steg 5: Opprett database-schema

1. **Åpne Supabase SQL Editor**:
   - Gå til ditt Supabase-prosjekt
   - Klikk "SQL Editor" i venstremenyen

2. **Kjør database-oppsettet**:
   - Åpne filen `database/schema.sql`
   - Kopier ALT innhold
   - Lim inn i Supabase SQL Editor
   - Klikk "Run" (eller Ctrl+Enter)

3. **Verifiser at det fungerte**:
   - Gå til "Table Editor"
   - Du skal se tabellene: `customers`, `customer_faqs`, `page_contexts`, `chat_logs`, `vector_chunks`
   - Sjekk at `customers`-tabellen har en rad med `customer_id = 'klvarme'`

## 🔨 Steg 6: Bygg widgeten

```bash
npm run build:widget
```

Du skal se:
```
✅ Widget built successfully!
📦 Output: .../public/widget.js
📏 Size: ~21KB
```

## 🧪 Steg 7: Test lokalt

```bash
npm start
```

1. **Åpne testside**: http://localhost:3000/test.html
2. **Test chat-widgeten**:
   - Klikk på den blå chat-knappen nederst høyre
   - Skriv "Hei" og trykk Enter
   - Du skal få svar fra Mistral AI

3. **Test API direkte**:
   ```bash
   # Health check
   curl http://localhost:3000/api/health
   
   # Config
   curl http://localhost:3000/api/config
   
   # Chat
   curl -X POST http://localhost:3000/api/chat \
     -H "Content-Type: application/json" \
     -d '{"message":"Hei, hva kan du hjelpe meg med?"}'
   ```

## 🌐 Steg 8: Deploy til produksjon (Vercel)

1. **Installer Vercel CLI**:
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Initial deployment**:
   ```bash
   vercel
   ```
   - Project name: `kl-varme-chatbot`
   - Directory: `.` (current)
   - Behold andre standarder

3. **Legg til miljøvariabler i Vercel**:
   - Gå til Vercel Dashboard
   - Velg prosjektet
   - Settings → Environment Variables
   - Legg til ALLE variabler fra `.env`-filen

4. **Deploy til produksjon**:
   ```bash
   vercel --prod
   ```

## ✅ Steg 9: Verifiser deployment

1. **Health check**: `https://your-project.vercel.app/api/health`
   ```json
   {
     "success": true,
     "data": {
       "status": "healthy",
       "services": {
         "database": "healthy",
         "mistral": "configured"
       },
       "ai_provider": "mistral_only",
       "gdpr_compliant": true
     }
   }
   ```

2. **Test widget**: `https://your-project.vercel.app/test.html`

3. **Widget URL**: `https://your-project.vercel.app/widget.js`

## 🎯 Steg 10: Bruk på AI Labben sin nettside

Legg til på nettsiden din:

```html
<!-- Før </body> tag -->
<script src="https://your-project.vercel.app/widget.js"></script>
<script>
  KLChatbot.init(); // Ingen konfigurasjon nødvendig!
</script>
```

## 🔍 Feilsøking

### Problem: "Mistral API not configured"
**Løsning**: Sjekk at `MISTRAL_API_KEY` er riktig satt i miljøvariabler

### Problem: "Customer not found"
**Løsning**: Sjekk at database-schema er kjørt og `klvarme` finnes i `customers`-tabellen

### Problem: Widget laster ikke
**Løsning**: Sjekk at widget.js er bygget (`npm run build:widget`) og tilgjengelig

### Problem: CORS-feil
**Løsning**: Sjekk `ALLOWED_ORIGINS` i miljøvariabler

## 📊 Overvåking

- **Health check**: `https://your-domain/api/health`
- **Database**: Supabase Dashboard → Table Editor → `chat_logs`
- **Logs**: Vercel Dashboard → Functions → Logs

## 🎉 Du er ferdig!

Nå har du:
- ✅ GDPR-kompatibel chatbot med Mistral AI
- ✅ Komplett database med AI Labben-data
- ✅ Fungerende widget på nettsiden
- ✅ Produksjonsdeploy på Vercel
- ✅ Logging og overvåking

## 🔄 Neste steg: Klone for kunder

Når du skal lage chatbot for en kunde, følg `CLONE_GUIDE.md`.

---

**🚀 AI Labben chatbot er nå live og klar for bruk!**
