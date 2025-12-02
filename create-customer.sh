#!/bin/bash

# Script for å opprette ny kunde-chatbot
# Usage: ./create-customer.sh kunde-navn port

set -e

KUNDE_NAVN=$1
PORT=$2
CUSTOMER_ID=$(uuidgen 2>/dev/null || python3 -c "import uuid; print(uuid.uuid4())")

if [ -z "$KUNDE_NAVN" ] || [ -z "$PORT" ]; then
    echo "Usage: ./create-customer.sh <kunde-navn> <port>"
    echo "Example: ./create-customer.sh bedrift-as 3001"
    exit 1
fi

echo "🏗️  Creating new customer: $KUNDE_NAVN"
echo "🆔 Customer ID: $CUSTOMER_ID"
echo "🌐 Port: $PORT"

# 1. Opprett ny mappe
CUSTOMER_DIR="../chatbot-$KUNDE_NAVN"
if [ -d "$CUSTOMER_DIR" ]; then
    echo "❌ Directory $CUSTOMER_DIR already exists!"
    exit 1
fi

echo "📁 Copying files to $CUSTOMER_DIR..."
cp -r . "$CUSTOMER_DIR"
cd "$CUSTOMER_DIR"

# 2. Oppdater customer.js
echo "🔧 Updating customer configuration..."
cat > src/config/customer.js << EOF
// Customer-specific configuration
// Dette er den ENESTE filen du endrer når du kloner repoet for en ny kunde

export const CUSTOMER_CONFIG = {
  // HOVEDKONFIGURASJON - Endre kun denne når du kloner repoet
  CUSTOMER_ID: "$CUSTOMER_ID",
  CUSTOMER_NAME: "$KUNDE_NAVN",
  
  // Widget-konfigurasjon (kan tilpasses per kunde)
  WIDGET: {
    name: "$KUNDE_NAVN Chat",
    subtitle: "Vi hjelper deg gjerne!",
    avatar: "${KUNDE_NAVN:0:2}",
    primaryColor: "#429D0A",
    welcomeMessage: {
      title: "Velkommen til $KUNDE_NAVN!",
      text: "Jeg er her for å hjelpe deg med dine spørsmål."
    }
  },
  
  // API-konfigurasjon
  API: {
    maxMessageLength: 2000,
    rateLimitPerMinute: 20,
    typingDelay: 1000,
    retryAttempts: 3
  }
};

// Validering
if (!CUSTOMER_CONFIG.CUSTOMER_ID) {
  console.warn('⚠️  CUSTOMER_ID er ikke satt i customer.js');
}

if (!CUSTOMER_CONFIG.CUSTOMER_NAME) {
  console.warn('⚠️  CUSTOMER_NAME er ikke satt i customer.js');
}
EOF

# 3. Opprett kunde-spesifikk .env template
cat > .env.example << EOF
# Mistral AI API (GDPR-vennlig europeisk AI)
MISTRAL_API_KEY=your-mistral-api-key-here

# Supabase (delt database)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key

# App Configuration
NODE_ENV=development
PORT=$PORT
ALLOWED_ORIGINS=http://localhost:$PORT,https://$KUNDE_NAVN.no

# Widget Configuration  
WIDGET_BASE_URL=https://chat-$KUNDE_NAVN.domain.no
EOF

# 4. Oppdater package.json
sed -i.bak "s/ai-chatbot-assistant/chatbot-$KUNDE_NAVN/g" package.json
rm package.json.bak 2>/dev/null || true

# 5. Bygg widget
echo "📦 Building widget for $KUNDE_NAVN..."
npm run build:widget

# 6. Opprett README for kunden
cat > README-$KUNDE_NAVN.md << EOF
# 🤖 Chatbot for $KUNDE_NAVN

## 🚀 Deployment
\`\`\`bash
# Deploy til Hetzner
../deploy-hetzner.sh $KUNDE_NAVN $PORT
\`\`\`

## 📱 Integrasjon på nettside
\`\`\`html
<script src="https://chat-$KUNDE_NAVN.domain.no/widget.js"></script>
<script>
  KLChatbot.init();
</script>
\`\`\`

## 🔧 Konfigurasjon
- **Customer ID**: \`$CUSTOMER_ID\`
- **Port**: \`$PORT\`
- **Widget URL**: \`https://chat-$KUNDE_NAVN.domain.no/widget.js\`

## 📊 Database Entry
Legg til i Supabase:
\`\`\`sql
INSERT INTO customers (customer_id, name, system_prompt, api_provider, model_name) 
VALUES (
    '$CUSTOMER_ID',
    '$KUNDE_NAVN',
    'Du er en hjelpsom kundeservice-assistent for $KUNDE_NAVN...',
    'mistral',
    'mistral-large-latest'
);
\`\`\`
EOF

echo ""
echo "✅ Customer $KUNDE_NAVN created successfully!"
echo "📁 Location: $CUSTOMER_DIR"
echo "🆔 Customer ID: $CUSTOMER_ID"
echo "🌐 Port: $PORT"
echo ""
echo "📋 Next steps:"
echo "1. Copy .env.example to .env and fill in API keys"
echo "2. Add customer to Supabase database (see README-$KUNDE_NAVN.md)"
echo "3. Deploy: ../deploy-hetzner.sh $KUNDE_NAVN $PORT"
