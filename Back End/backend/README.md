# S.A.F.E. KWASU Backend API

Complete backend implementation for the Smart Alert and Field Emergency System.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MySQL 8+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# - Database credentials
# - JWT secret
# - Termii API key (for SMS)
```

### Database Setup

```sql
-- Create database
CREATE DATABASE safe_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (optional, for production)
CREATE USER 'safe_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON safe_db.* TO 'safe_user'@'localhost';
FLUSH PRIVILEGES;
```

### Seed Database

```bash
# Populate with sample data
npm run seed
```

### Run Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/profile` | Get current user profile |
| PUT | `/api/auth/profile` | Update profile |

### Incidents

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/incidents` | Create incident (with AI classification) |
| GET | `/api/incidents` | Get incidents (filtered by role) |
| GET | `/api/incidents/:id` | Get single incident with messages |
| PATCH | `/api/incidents/:id` | Update incident (admin only) |
| GET | `/api/incidents/stats` | Get incident statistics |

### Alerts

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/alerts` | Trigger emergency alert |
| GET | `/api/alerts` | Get alerts |
| GET | `/api/alerts/active` | Get active alerts (admin) |
| POST | `/api/alerts/:id/acknowledge` | Acknowledge alert (admin) |
| POST | `/api/alerts/:id/resolve` | Resolve alert (admin) |

### Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/messages` | Send message |
| GET | `/api/messages/incident/:id` | Get incident messages |
| PATCH | `/api/messages/:id/read` | Mark message as read |

### Mesh Networking

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/mesh/sync` | Sync mesh packet from gateway |
| GET | `/api/mesh/packets` | Get mesh packet logs (admin) |
| GET | `/api/mesh/stats` | Get mesh statistics (admin) |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Dashboard statistics (admin) |
| GET | `/api/analytics/hotspots` | DBSCAN hotspot data (admin) |
| GET | `/api/analytics/trend` | Incident trend data (admin) |

## 🔌 Socket.io Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join_incident` | `incidentId` | Join incident chat room |
| `leave_incident` | `incidentId` | Leave incident chat room |
| `typing` | `{ incidentId, userId }` | User typing indicator |
| `stop_typing` | `{ incidentId, userId }` | Stop typing indicator |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `new_incident` | Incident data | New incident reported |
| `emergency_alert` | Alert data | Emergency alert triggered |
| `mesh_alert_synced` | Alert data | Mesh alert synced |
| `new_message` | Message data | New chat message |
| `status_update` | `{ incidentId, status }` | Incident status changed |
| `alert_acknowledged` | `{ alertId }` | Alert acknowledged |
| `alert_resolved` | `{ alertId }` | Alert resolved |

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_token>
```

Tokens are obtained via `/api/auth/login` or `/api/auth/register`.

## 📱 AI Integration

The backend integrates with a Python AI service for:

- **Incident Classification**: DistilBERT NLP model
- **Severity Scoring**: 0-100 risk assessment
- **Fake Report Detection**: Confidence-based flagging

Configure the AI service URL in `.env`:

```env
AI_SERVICE_URL=http://localhost:8000
```

If the AI service is unavailable, the backend falls back to keyword-based classification.

## 📶 Mesh Networking

The system supports offline emergency alerts via mesh networking:

1. Mobile app encrypts alert payload with AES-256
2. Packet broadcast via BLE/Wi-Fi Direct
3. Gateway nodes sync to backend via `/api/mesh/sync`
4. SMS fallback triggers after 15 seconds if unacknowledged

## 📧 SMS Integration

Configured with Termii (Nigerian SMS gateway):

```env
TERMII_API_KEY=your_api_key
TERMII_SENDER_ID=N-Alert
SECURITY_PHONE=+2348000000000
```

SMS fallback triggers:
- 15 seconds after emergency alert if unacknowledged
- Hourly for alerts unacknowledged > 1 hour

## 🗓️ Scheduled Tasks

| Schedule | Task |
|----------|------|
| Daily 2 AM | Clean up old notifications (30+ days) |
| Hourly | Check for unacknowledged alerts |

## 🧪 Testing

```bash
# Health check
curl http://localhost:5000/health

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"institutional_email":"security@kwasu.edu.ng","password":"safe-admin"}'
```

## 📊 Default Credentials (After Seeding)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@kwasu.edu.ng | safe-super-admin |
| Security Admin | security@kwasu.edu.ng | safe-admin |
| Officer | james.bello@kwasu.edu.ng | safe-officer |
| Student | adewale@kwasu.edu.ng | password |
| Student | fatima@kwasu.edu.ng | password |

## 🛡️ Security Features

- Password hashing with bcrypt (12 rounds)
- JWT authentication with configurable expiry
- Role-based access control (RBAC)
- CORS configuration
- Helmet.js security headers
- Input validation with validator.js
- SQL injection protection (Sequelize ORM)

## 📈 Performance

- Connection pooling (MySQL)
- Indexed database queries
- Socket.io for real-time updates
- Efficient mesh packet handling

## 🚀 Deployment

### Production Environment Variables

```env
NODE_ENV=production
PORT=5000
DB_HOST=your-db-host
DB_USER=prod_user
DB_PASSWORD=strong_password
DB_NAME=safe_db
JWT_SECRET=very_long_random_string
CORS_ORIGINS=https://your-frontend.com
TERMII_API_KEY=your_production_key
```

### Using PM2

```bash
npm install -g pm2
pm2 start server.js --name safe-backend
pm2 save
pm2 startup
```

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

## 📝 License

KWASU Computer Science Department Project
