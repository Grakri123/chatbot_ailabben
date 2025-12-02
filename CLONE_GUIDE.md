# 📋 Guide: Klone repo for ny kunde

Denne guiden viser hvordan du kloner dette repoet for å lage en dedikert chatbot for en ny kunde.

## 🎯 Konsept

- **Én database**: Alle kunder bruker samme Supabase-database
- **Flere repos**: Hver kunde får sitt eget repo med hardkodet customer_id
- **Enkel kloning**: Kun én fil må endres per ny kunde

## 🔄 Steg for å klone til ny kunde

### 1. Klon repoet
```bash
git clone <dette-repoet> chatbot-[kunde-navn]
cd chatbot-[kunde-navn]
rm -rf .git
git init
```

### 2. Endre customer_id (ENESTE ENDRING)
Åpne `src/config/customer.js` og endre:

```javascript
export const CUSTOMER_CONFIG = {
  // HOVEDKONFIGURASJON - Endre kun denne når du kloner repoet
  CUSTOMER_ID: "ny-kunde-id",  // ← ENDRE DETTE
  
  // Widget-konfigurasjon (kan tilpasses per kunde)
  WIDGET: {
    name: "Ny Kunde Chat",
    subtitle: "Vi hjelper deg gjerne!",
    avatar: "NK",
    primaryColor: "#2563eb",
    welcomeMessage: {
      title: "Velkommen til Ny Kunde!",
      text: "Jeg er her for å hjelpe deg med dine spørsmål."
    }
  }
  // ... resten kan endres etter behov
};
```

### 3. Legg til kunde i database (kun første gang)
Hvis dette er første gang du setter opp systemet, kjør database-setup:
```bash
npm run db:setup
```

Hvis databasen allerede eksisterer, legg til den nye kunden:
```sql
INSERT INTO customers (customer_id, name, system_prompt, api_provider, model_name) 
VALUES (
    'ny-kunde-id',
    'Ny Kunde AS',
    'Du er en hjelpsom kundeservice-assistent for Ny Kunde AS...',
    'openai',
    'gpt-4o'
);
```

### 4. Deploy til egen URL
```bash
# Vercel
vercel --prod

# Eller egen server
npm start
```

### 5. Bruk på kundens nettside
```html
<script src="https://chat-ny-kunde.vercel.app/widget.js"></script>
<script>
  KLChatbot.init(); // Ingen config nødvendig!
</script>
```

## 🎨 Tilpasning per kunde

All tilpasning gjøres i `src/config/customer.js`:

```javascript
export const CUSTOMER_CONFIG = {
  CUSTOMER_ID: "kunde-id",
  
  WIDGET: {
    name: "Kundens Navn Chat",
    subtitle: "Tilpasset undertekst",
    avatar: "KN", // 1-3 bokstaver
    primaryColor: "#ff6b35", // Kundens merkevarefarger
    welcomeMessage: {
      title: "Velkommen til [Kunde]!",
      text: "Spesialtilpasset velkomstmelding"
    }
  },
  
  API: {
    maxMessageLength: 2000,
    rateLimitPerMinute: 20,
    typingDelay: 1000,
    retryAttempts: 3
  }
};
```

## 📊 Database-struktur (delt)

Alle kunder bruker samme database med disse tabellene:

### customers
- `customer_id` (unik per kunde)
- `system_prompt` (AI-instruksjoner)
- `api_provider` (openai/mistral)

### customer_faqs
- FAQ per kunde med URL-patterns

### page_contexts  
- Sidespesifikk kontekst per kunde

### chat_logs
- Samtaler logget per kunde

## 🔧 Eksempel: KL Varme → Ny Kunde

**Original (KL Varme)**:
```javascript
CUSTOMER_ID: "klvarme",
WIDGET: {
  name: "KL Varme Chat",
  subtitle: "Vi hjelper deg gjerne!",
  avatar: "KL",
  primaryColor: "#2563eb",
  welcomeMessage: {
    title: "Velkommen til KL Varme!",
    text: "Spørsmål om varmepumper og energiløsninger."
  }
}
```

**Ny kunde (Eksempel Bedrift)**:
```javascript
CUSTOMER_ID: "eksempel-bedrift",
WIDGET: {
  name: "Eksempel Bedrift Chat",
  subtitle: "Alltid til din tjeneste!",
  avatar: "EB",
  primaryColor: "#10b981",
  welcomeMessage: {
    title: "Hei! Hvordan kan vi hjelpe?",
    text: "Jeg kan hjelpe deg med alle våre tjenester."
  }
}
```

## ✅ Sjekkliste for ny kunde

- [ ] Klonet repo til nytt navn
- [ ] Endret `CUSTOMER_ID` i `customer.js`
- [ ] Tilpasset widget-design (navn, farger, tekst)
- [ ] Lagt til kunde i Supabase database
- [ ] Lagt til FAQ og kontekst for kunden
- [ ] Testet lokalt (`npm start`)
- [ ] Deployet til produksjon
- [ ] Testet widget på kundens nettside
- [ ] Verifisert at samtaler logges korrekt

## 🚀 Fordeler med denne strukturen

✅ **Enkel kloning**: Kun én fil å endre  
✅ **Isolerte deployments**: Hver kunde får sin egen URL  
✅ **Delt database**: Enkel administrasjon og backup  
✅ **Skalerbart**: Legg til nye kunder uten å påvirke eksisterende  
✅ **Tilpassbart**: Hver kunde kan ha unikt design og oppførsel  
✅ **Vedlikeholdbart**: Oppdateringer kan rulles ut til alle kunder  

## 🔄 Oppdatering av alle kunder

Når du har forbedringer som skal til alle kunder:

1. Oppdater hovedrepoet (dette)
2. For hver kunde-repo:
   ```bash
   # Backup customer.js
   cp src/config/customer.js customer-backup.js
   
   # Pull latest changes
   git pull hovedrepo main
   
   # Restore customer config
   cp customer-backup.js src/config/customer.js
   
   # Deploy
   npm run build:widget
   vercel --prod
   ```

---

**🎉 Nå kan du enkelt skalere chatbotten til ubegrenset antall kunder!**
