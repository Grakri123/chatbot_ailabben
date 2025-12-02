# 🚀 Deployment Guide

Detaljert guide for å deploye AI Chatbot Assistant til produksjon.

## 📋 Forutsetninger

- [x] Node.js 18+ installert
- [x] Supabase-konto og prosjekt opprettet
- [x] OpenAI API-nøkkel (eller Mistral API-nøkkel)
- [x] Vercel-konto (for Vercel deployment)

## 🔧 Pre-deployment sjekkliste

### 1. Database setup

1. **Opprett Supabase prosjekt**:
   - Gå til [supabase.com](https://supabase.com)
   - Opprett nytt prosjekt
   - Noter ned URL og API-nøkler

2. **Kjør database schema**:
   \`\`\`bash
   npm run db:setup
   \`\`\`
   
   Eller manuelt i Supabase SQL Editor:
   - Kopier innholdet fra \`database/schema.sql\`
   - Kjør SQL-kommandoene

3. **Verifiser database**:
   - Sjekk at alle tabeller er opprettet
   - Verifiser at sample data for "klvarme" finnes

### 2. API-nøkler

1. **OpenAI API**:
   - Gå til [platform.openai.com](https://platform.openai.com)
   - Generer ny API-nøkkel
   - Sett opp billing hvis nødvendig

2. **Mistral AI** (valgfritt):
   - Gå til [console.mistral.ai](https://console.mistral.ai)
   - Generer API-nøkkel

### 3. Bygg widget

\`\`\`bash
npm run build:widget
\`\`\`

Verifiser at \`public/widget.js\` og \`public/widget.min.js\` er opprettet.

## 🌐 Vercel Deployment (anbefalt)

### Steg 1: Installer Vercel CLI

\`\`\`bash
npm install -g vercel
vercel login
\`\`\`

### Steg 2: Initial deployment

\`\`\`bash
vercel
\`\`\`

Følg instruksjonene:
- Project name: \`ai-chatbot-assistant\`
- Directory: \`./\` (current)
- Settings: Behold standarder

### Steg 3: Konfigurer miljøvariabler

I Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| \`OPENAI_API_KEY\` | \`sk-your-key...\` | Production, Preview, Development |
| \`MISTRAL_API_KEY\` | \`your-mistral-key\` | Production, Preview, Development |
| \`SUPABASE_URL\` | \`https://xxx.supabase.co\` | Production, Preview, Development |
| \`SUPABASE_ANON_KEY\` | \`eyJhbGc...\` | Production, Preview, Development |
| \`SUPABASE_SERVICE_KEY\` | \`eyJhbGc...\` | Production, Preview, Development |
| \`NODE_ENV\` | \`production\` | Production |
| \`WIDGET_BASE_URL\` | \`https://your-domain.vercel.app\` | Production |

### Steg 4: Deploy til produksjon

\`\`\`bash
npm run deploy
\`\`\`

### Steg 5: Verifiser deployment

1. **Health check**: \`https://your-domain.vercel.app/api/health\`
2. **Widget**: \`https://your-domain.vercel.app/widget.js\`
3. **Test page**: \`https://your-domain.vercel.app/test.html\`

## 🖥️ Self-hosted deployment

### Docker (anbefalt for self-hosting)

1. **Opprett Dockerfile**:
   \`\`\`dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY . .
   RUN npm run build:widget
   
   EXPOSE 3000
   CMD ["npm", "start"]
   \`\`\`

2. **Bygg og kjør**:
   \`\`\`bash
   docker build -t ai-chatbot .
   docker run -p 3000:3000 --env-file .env ai-chatbot
   \`\`\`

### PM2 (Node.js process manager)

1. **Installer PM2**:
   \`\`\`bash
   npm install -g pm2
   \`\`\`

2. **Opprett ecosystem.config.js**:
   \`\`\`javascript
   module.exports = {
     apps: [{
       name: 'ai-chatbot',
       script: 'server.js',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   };
   \`\`\`

3. **Start applikasjonen**:
   \`\`\`bash
   npm run build:widget
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   \`\`\`

### Nginx reverse proxy

\`\`\`nginx
server {
    listen 80;
    server_name chat.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache widget files
    location ~* \.(js|css)$ {
        proxy_pass http://localhost:3000;
        expires 1h;
        add_header Cache-Control "public, immutable";
    }
}
\`\`\`

## 🔒 SSL/HTTPS

### Vercel
SSL er automatisk aktivert for alle Vercel deployments.

### Self-hosted med Let's Encrypt

\`\`\`bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d chat.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
\`\`\`

## 📊 Overvåking og logging

### Vercel

1. **Function logs**: Vercel Dashboard → Project → Functions
2. **Analytics**: Aktivér Vercel Analytics
3. **Error tracking**: Integrer med Sentry

### Self-hosted

1. **PM2 monitoring**:
   \`\`\`bash
   pm2 monit
   pm2 logs ai-chatbot
   \`\`\`

2. **Log rotation**:
   \`\`\`bash
   pm2 install pm2-logrotate
   \`\`\`

## 🌍 Custom domain

### Vercel

1. Vercel Dashboard → Project → Settings → Domains
2. Legg til ditt domene
3. Konfigurer DNS-records som vist

### Self-hosted

1. Pek ditt domene til server-IP
2. Konfigurer Nginx virtual host
3. Sett opp SSL-sertifikat

## 🔧 Environment-spesifikke konfigurasjoner

### Produksjon

\`\`\`.env
NODE_ENV=production
OPENAI_API_KEY=sk-prod-key...
SUPABASE_URL=https://prod.supabase.co
# Bruk production API keys
\`\`\`

### Staging

\`\`\`.env
NODE_ENV=staging
OPENAI_API_KEY=sk-dev-key...
SUPABASE_URL=https://staging.supabase.co
# Bruk test/staging keys
\`\`\`

## 🚨 Troubleshooting

### Vanlige problemer

1. **"Customer not found"**:
   - Sjekk at customer_id finnes i database
   - Verifiser database connection

2. **"API key not configured"**:
   - Sjekk miljøvariabler
   - Restart server etter endringer

3. **CORS errors**:
   - Sjekk ALLOWED_ORIGINS setting
   - Verifiser domain configuration

4. **Widget ikke laster**:
   - Sjekk widget.js URL
   - Verifiser Content-Type headers

### Debug-kommandoer

\`\`\`bash
# Test database connection
curl https://your-domain.com/api/health

# Test customer config
curl "https://your-domain.com/api/config?customer_id=klvarme"

# Test chat API
curl -X POST https://your-domain.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"customer_id":"klvarme","message":"test"}'
\`\`\`

## 📈 Performance optimization

### Vercel

1. **Edge caching**: Konfigurert i \`vercel.json\`
2. **Function regions**: Sett til nærmeste region
3. **Bundle size**: Widget er optimalisert

### Self-hosted

1. **Gzip compression**:
   \`\`\`nginx
   gzip on;
   gzip_types text/plain text/css application/javascript;
   \`\`\`

2. **Static file caching**:
   \`\`\`nginx
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   \`\`\`

## 🔄 CI/CD Pipeline

### GitHub Actions eksempel

\`\`\`.yaml
name: Deploy to Vercel

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build widget
        run: npm run build:widget
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
\`\`\`

## ✅ Post-deployment sjekkliste

- [ ] Health check returnerer "healthy"
- [ ] Widget laster korrekt på test-siden
- [ ] Chat-funksjonalitet virker
- [ ] Meldinger lagres i database
- [ ] SSL-sertifikat er aktivt
- [ ] Monitoring er satt opp
- [ ] Backup-rutiner er konfigurert
- [ ] Error tracking fungerer
- [ ] Performance metrics samles inn

---

**🎉 Gratulerer! Din AI Chatbot Assistant er nå live i produksjon!**
