# Deployment Guide

Instructions for deploying Rehber360 to production.

## 🚀 Replit Deployment (Recommended)

Rehber360 is optimized for Replit deployment.

### Prerequisites

- Replit account
- Upgraded Replit plan (for always-on deployment)

### Deployment Steps

1. **Fork/Import to Replit**
   - Click "Import from GitHub" on Replit
   - Enter repository URL
   - Replit auto-detects Node.js project

2. **Configure Secrets**
   
   In Replit Secrets tab, add:
   ```
   SESSION_SECRET=<random-32-char-string>
   ENCRYPTION_KEY=<random-16-char-string>
   GEMINI_API_KEY=<your-gemini-key>
   OPENAI_API_KEY=<your-openai-key>  (optional)
   NODE_ENV=production
   ```

3. **Configure .replit File**
   
   Already configured in project root:
   ```toml
   run = "npm start"
   
   [deployment]
   run = ["sh", "-c", "npm run build && npm start"]
   deploymentTarget = "cloudrun"
   ```

4. **Deploy**
   
   Click "Deploy" button in Replit.

5. **Database Persistence**
   
   Database file (`database.db`) is automatically persisted in Replit storage.

### Post-Deployment

- **Custom Domain**: Configure in Replit deployment settings
- **SSL**: Automatically provided by Replit
- **Backups**: Automated daily backups to `/backups/` directory

---

## 🏢 VPS Deployment (Ubuntu/Debian)

### Server Requirements

- **OS**: Ubuntu 20.04+ or Debian 11+
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 10GB minimum
- **CPU**: 2 cores recommended

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install build tools
sudo apt install -y build-essential python3

# Install PM2 (process manager)
sudo npm install -g pm2
```

### 2. Deploy Application

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/your-org/rehber360.git
cd rehber360

# Install dependencies
npm install --production

# Build application
npm run build
```

### 3. Environment Configuration

```bash
# Create production .env
sudo nano .env
```

Add production environment variables:
```env
NODE_ENV=production
PORT=3000
SESSION_SECRET=<production-secret>
ENCRYPTION_KEY=<production-key>
DATABASE_PATH=/var/www/rehber360/database.db
GEMINI_API_KEY=<your-key>
```

### 4. Start with PM2

```bash
# Start application
pm2 start dist/server/node-build.mjs --name rehber360

# Enable startup on reboot
pm2 startup systemd
pm2 save

# Monitor
pm2 status
pm2 logs rehber360
```

### 5. Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install -y nginx

# Create configuration
sudo nano /etc/nginx/sites-available/rehber360
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/rehber360 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal (already configured)
sudo certbot renew --dry-run
```

---

## 🐳 Docker Deployment (Alternative)

### Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production

# Copy application
COPY . .

# Build
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  rehber360:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - SESSION_SECRET=${SESSION_SECRET}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    volumes:
      - ./database.db:/app/database.db
      - ./backups:/app/backups
    restart: unless-stopped
```

### Deploy with Docker

```bash
# Build image
docker-compose build

# Start container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop container
docker-compose down
```

---

## 🔄 Update Deployment

### Replit Update

```bash
# Pull latest changes (Replit Shell)
git pull origin main
npm install
npm run build

# Replit auto-restarts on file changes
```

### VPS Update

```bash
# Pull changes
cd /var/www/rehber360
git pull origin main

# Install new dependencies
npm install --production

# Rebuild
npm run build

# Restart with PM2
pm2 restart rehber360

# Check status
pm2 logs rehber360
```

---

## 📊 Monitoring

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# Check logs
pm2 logs rehber360

# View metrics
pm2 describe rehber360
```

### Health Checks

Create health check endpoint:

```typescript
// server/routes/health.ts
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: checkDatabaseHealth(),
    memory: process.memoryUsage()
  });
});
```

---

## 🔒 Production Security

### Security Checklist

- [ ] HTTPS enabled (SSL certificate)
- [ ] Strong SESSION_SECRET (32+ characters)
- [ ] Encryption key configured
- [ ] Firewall configured (allow only 80, 443, SSH)
- [ ] Database file permissions (chmod 600)
- [ ] Regular backups configured
- [ ] Rate limiting enabled
- [ ] CORS configured for production domain
- [ ] No debug logs in production
- [ ] Error tracking configured

### Firewall Configuration (UFW)

```bash
# Enable firewall
sudo ufw enable

# Allow SSH, HTTP, HTTPS
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https

# Check status
sudo ufw status
```

---

## 💾 Backup Strategy

### Automated Backups

Backups run daily at 3 AM (configured in server):

```typescript
// server/scripts/schedulers/backup.scheduler.ts
cron.schedule('0 3 * * *', async () => {
  await createBackup();
});
```

### Manual Backup

```bash
# Create backup
cp database.db backups/manual-backup-$(date +%Y%m%d).db

# Compress
gzip backups/manual-backup-$(date +%Y%m%d).db
```

### Restore Backup

```bash
# Stop application
pm2 stop rehber360

# Restore database
cp backups/backup-20251029.db database.db

# Start application
pm2 start rehber360
```

---

## 📈 Performance Optimization

### Production Settings

```env
NODE_ENV=production
NODE_OPTIONS="--max-old-space-size=2048"
```

### Nginx Caching

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### PM2 Cluster Mode

```bash
# Start multiple instances
pm2 start dist/server/node-build.mjs -i max --name rehber360
```

---

## 🆘 Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs rehber360

# Check port availability
sudo netstat -tulpn | grep :3000

# Check database permissions
ls -la database.db
```

### Database Issues

```bash
# Check integrity
sqlite3 database.db "PRAGMA integrity_check;"

# Restore from backup
pm2 stop rehber360
cp backups/latest.db database.db
pm2 start rehber360
```

### High Memory Usage

```bash
# Check memory
pm2 monit

# Restart application
pm2 restart rehber360

# Adjust Node.js memory limit
pm2 delete rehber360
pm2 start dist/server/node-build.mjs --name rehber360 --node-args="--max-old-space-size=2048"
```

---

**Related Documentation:**
- [Setup Guide](./setup.md)
- [Development Guide](./development.md)

**Last Updated:** October 29, 2025
