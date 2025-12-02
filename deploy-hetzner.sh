#!/bin/bash

# Hetzner Server Deployment Script
# Usage: ./deploy-hetzner.sh kunde-navn port

set -e

KUNDE_NAVN=$1
PORT=$2
SERVER_USER="root"  # Endre til din server bruker
SERVER_HOST="your-hetzner-server.com"  # Endre til din server IP/domain
BASE_PATH="/var/www/chatbots"

if [ -z "$KUNDE_NAVN" ] || [ -z "$PORT" ]; then
    echo "Usage: ./deploy-hetzner.sh <kunde-navn> <port>"
    echo "Example: ./deploy-hetzner.sh kunde1 3001"
    exit 1
fi

echo "🚀 Deploying chatbot for $KUNDE_NAVN on port $PORT..."

# 1. Bygg widget lokalt
echo "📦 Building widget..."
npm run build:widget

# 2. Opprett deployment-pakke
DEPLOY_DIR="deploy-$KUNDE_NAVN"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

# Kopier nødvendige filer
cp -r api/ $DEPLOY_DIR/
cp -r src/ $DEPLOY_DIR/
cp -r database/ $DEPLOY_DIR/
cp -r public/ $DEPLOY_DIR/
cp server.js $DEPLOY_DIR/
cp package.json $DEPLOY_DIR/
cp vercel.json $DEPLOY_DIR/

# Opprett kunde-spesifikk .env
cat > $DEPLOY_DIR/.env << EOF
# Mistral AI API
MISTRAL_API_KEY=\$MISTRAL_API_KEY

# Supabase (delt database)
SUPABASE_URL=\$SUPABASE_URL
SUPABASE_ANON_KEY=\$SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY=\$SUPABASE_SERVICE_KEY

# App Configuration
NODE_ENV=production
PORT=$PORT
ALLOWED_ORIGINS=*

# Widget Configuration
WIDGET_BASE_URL=https://chat-$KUNDE_NAVN.domain.no
EOF

# 3. Upload til server
echo "📤 Uploading to server..."
rsync -avz --delete $DEPLOY_DIR/ $SERVER_USER@$SERVER_HOST:$BASE_PATH/$KUNDE_NAVN-chatbot/

# 4. Installer og start på server
echo "🔧 Installing and starting on server..."
ssh $SERVER_USER@$SERVER_HOST << EOF
cd $BASE_PATH/$KUNDE_NAVN-chatbot

# Installer dependencies
npm install --production

# Stop existing process
pm2 stop chatbot-$KUNDE_NAVN || true
pm2 delete chatbot-$KUNDE_NAVN || true

# Start ny instans
pm2 start server.js --name chatbot-$KUNDE_NAVN --env production

# Save PM2 configuration
pm2 save
EOF

# 5. Opprett Nginx config
echo "🌐 Creating Nginx configuration..."
ssh $SERVER_USER@$SERVER_HOST << EOF
cat > /etc/nginx/sites-available/chat-$KUNDE_NAVN << 'NGINX_EOF'
server {
    listen 80;
    server_name chat-$KUNDE_NAVN.domain.no;
    
    # Security headers
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    location / {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # CORS headers for widget
        add_header Access-Control-Allow-Origin "*";
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization";
    }
    
    # Widget caching
    location ~* \.(js|css)$ {
        expires 1h;
        add_header Cache-Control "public, immutable";
    }
}
NGINX_EOF

# Enable site
ln -sf /etc/nginx/sites-available/chat-$KUNDE_NAVN /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
EOF

echo "✅ Deployment complete!"
echo "🌐 Widget URL: https://chat-$KUNDE_NAVN.domain.no/widget.js"
echo "🧪 Test page: https://chat-$KUNDE_NAVN.domain.no/test.html"

# Cleanup
rm -rf $DEPLOY_DIR

echo ""
echo "📋 Next steps:"
echo "1. Update DNS: chat-$KUNDE_NAVN.domain.no -> your-server-ip"
echo "2. Setup SSL: certbot --nginx -d chat-$KUNDE_NAVN.domain.no"
echo "3. Test widget on customer's site"
