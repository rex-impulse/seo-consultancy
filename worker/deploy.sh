#!/bin/bash
set -e

EC2_HOST="ubuntu@98.84.220.168"
SSH_KEY="$HOME/.ssh/impulse"
REMOTE_DIR="/home/ubuntu/seo-worker"

echo "==> Installing Node.js on EC2 if needed..."
ssh -i $SSH_KEY -o StrictHostKeyChecking=no $EC2_HOST '
  if ! command -v node &>/dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
  fi
  node --version
  npm --version
'

echo "==> Syncing worker files..."
ssh -i $SSH_KEY $EC2_HOST "mkdir -p $REMOTE_DIR/src/lib/audit $REMOTE_DIR/worker"

# Sync source files
scp -i $SSH_KEY -r \
  src/lib/audit/crawler.ts \
  src/lib/audit/pagespeed.ts \
  src/lib/audit/scoring.ts \
  $EC2_HOST:$REMOTE_DIR/src/lib/audit/

scp -i $SSH_KEY \
  worker/index.ts \
  worker/package.json \
  $EC2_HOST:$REMOTE_DIR/worker/

scp -i $SSH_KEY \
  tsconfig.json \
  $EC2_HOST:$REMOTE_DIR/

echo "==> Installing dependencies..."
ssh -i $SSH_KEY $EC2_HOST "cd $REMOTE_DIR/worker && npm install"

echo "==> Setting up systemd service..."
ssh -i $SSH_KEY $EC2_HOST "sudo tee /etc/systemd/system/seo-worker.service > /dev/null << 'UNIT'
[Unit]
Description=SEO Audit Worker
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/seo-worker
ExecStart=/usr/bin/npx --prefix worker tsx worker/index.ts
Restart=always
RestartSec=5
Environment=PORT=3002
Environment=SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZHJkenB0d3JieHJnenBqbWhwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMyNDM0NSwiZXhwIjoyMDg2OTAwMzQ1fQ.LdI4IMcN5smeI_5u6xnZHoSg_mshKUOflmCBiTUIWvY
Environment=WORKER_SECRET=impulse-audit-worker-2026

[Install]
WantedBy=multi-user.target
UNIT"

echo "==> Starting worker..."
ssh -i $SSH_KEY $EC2_HOST "
  sudo systemctl daemon-reload
  sudo systemctl enable seo-worker
  sudo systemctl restart seo-worker
  sleep 2
  sudo systemctl status seo-worker --no-pager
"

echo "==> Adding Caddy route..."
ssh -i $SSH_KEY $EC2_HOST "
  # Add worker route to Caddy if not already there
  if ! grep -q 'audit-worker' /etc/caddy/Caddyfile; then
    sudo sed -i '/^api.impulsestudios.cc/i\\
audit-worker.impulsestudios.cc {\n    reverse_proxy localhost:3002\n    encode gzip\n}\n' /etc/caddy/Caddyfile
    sudo systemctl reload caddy
  fi
"

echo "==> Testing..."
ssh -i $SSH_KEY $EC2_HOST "curl -s http://localhost:3002/health"
echo ""
echo "==> Done! Worker running on EC2:3002"
