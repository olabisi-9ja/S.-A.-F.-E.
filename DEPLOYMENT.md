# S.A.F.E. KWASU — Deployment Guide

## Local Development

```powershell
# Terminal 1 — Backend API
cd "Back End/backend"
npm install
npm run seed    # First time only
npm run dev     # Starts on http://localhost:5000

# Terminal 2 — Frontend SPA
cd "Front End"
npm install
npm run dev     # Starts on http://localhost:5173
```

## Production Deployment

### 1. Push to GitHub

```bash
# Create a GitHub repo, then:
git remote add origin https://github.com/YOUR_USER/safe-kwasu.git
git branch -M main
git push -u origin main
```

---

### 2. Frontend → Vercel

**Option A: Via GitHub (automatic)**
1. Go to [vercel.com](https://vercel.com) and log in with GitHub
2. Click **Add New → Project**
3. Import your `safe-kwasu` repo
4. Set **Root Directory** to `Front End`
5. Add environment variable: `VITE_API_URL=https://your-vps-domain.com/api`
6. Click **Deploy**
7. Vercel provides an auto-generated URL like `safe-kwasu.vercel.app`

**Option B: Via CLI**
```bash
npm i -g vercel
cd "Front End"
vercel --prod
```

Set env variable in Vercel dashboard:
```
VITE_API_URL=https://your-vps-domain.com/api
```

---

### 3. Backend → VPS (Ubuntu 20.04+)

#### 3.1 Initial VPS Setup

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL 8
sudo apt install mysql-server-8.0
sudo mysql_secure_installation

# Create database
sudo mysql -u root -p
```

```sql
CREATE DATABASE safe_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'safe_prod'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON safe_db.* TO 'safe_prod'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 3.2 Deploy Backend Code

```bash
# Create directory
sudo mkdir -p /var/www/safe-kwasu
sudo chown $USER:$USER /var/www/safe-kwasu

# Clone your repo
git clone https://github.com/YOUR_USER/safe-kwasu.git /var/www/safe-kwasu

# Install dependencies (production only)
cd /var/www/safe-kwasu
npm ci --only-production

# Copy and configure environment
cp .env.production .env
nano .env   # Fill in database password, JWT secret, CORS origins
```

#### 3.3 Seed Database

```bash
cd /var/www/safe-kwasu/Back End/backend
npm run seed
```

#### 3.4 Setup PM2 Process Manager

```bash
sudo npm install -g pm2

# Create log directory
sudo mkdir -p /var/log/safe-backend
sudo chown $USER:$USER /var/log/safe-backend

# Start with PM2 (uses ecosystem.config.js)
cd /var/www/safe-kwasu/Back End/backend
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # Run the output command to enable on boot
```

#### 3.5 Setup Nginx Reverse Proxy

```bash
sudo apt install nginx

sudo tee /etc/nginx/sites-available/safe-backend > /dev/null << 'NGINX'
server {
    listen 80;
    server_name your-vps-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
}
NGINX

sudo ln -s /etc/nginx/sites-available/safe-backend /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

#### 3.6 Setup SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-vps-domain.com
```

---

### 4. Connect Frontend ↔ Backend

In your Vercel project dashboard:
1. Go to **Settings → Environment Variables**
2. Add: `VITE_API_URL=https://your-vps-domain.com/api`
3. **Redeploy** the project

In your backend `.env`:
```
CORS_ORIGINS=https://your-project.vercel.app
```

---

### 5. Verify Deployment

```bash
# Backend health check
curl https://your-vps-domain.com/health

# Test login
curl -X POST https://your-vps-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"institutional_email":"security@kwasu.edu.ng","password":"safe-admin"}'
```

Open your Vercel URL in the browser and log in.

---

### Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@kwasu.edu.ng | safe-super-admin |
| Security Admin | security@kwasu.edu.ng | safe-admin |
| Student | adewale@kwasu.edu.ng | password |
| Student | fatima@kwasu.edu.ng | password |
