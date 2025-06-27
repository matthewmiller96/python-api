# 🚀 Complete Containerized Shipping API Platform

## One-Command Deployment to Server 10.0.0.108

This setup packages **everything** into a single Docker container:
- ✅ FastAPI Backend (Port 3000)
- ✅ React Frontend (Port 80)
- ✅ Nginx Reverse Proxy
- ✅ Database (SQLite, persistent)

## 📦 Quick Deployment

### On your server (10.0.0.108):

```bash
# Clone the repository
git clone https://github.com/matthewmiller96/python-api.git
cd python-api

# Deploy everything with one command
./deploy-complete.sh
```

That's it! The script will:
1. Pull latest changes
2. Build the complete container with frontend + backend
3. Start the services
4. Test the deployment

## 🌐 Access Your Application

After deployment:
- **Frontend (Main App)**: http://10.0.0.108/
- **API Documentation**: http://10.0.0.108:3000/docs
- **API Health Check**: http://10.0.0.108:3000/

## 🔧 Container Architecture

```
┌─────────────────────────────────────┐
│           Docker Container          │
│                                     │
│  ┌─────────────┐  ┌──────────────┐  │
│  │   Nginx     │  │   FastAPI    │  │
│  │   (Port 80) │  │   (Port 3000)│  │
│  │             │  │              │  │
│  │ React Files │◄─┤ API Endpoints│  │
│  └─────────────┘  └──────────────┘  │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │        SQLite Database          │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## 🛠️ Management Commands

```bash
# View logs
docker-compose -f docker-compose.all-in-one.yml logs -f

# Restart services
docker-compose -f docker-compose.all-in-one.yml restart

# Stop everything
docker-compose -f docker-compose.all-in-one.yml down

# Rebuild and restart
docker-compose -f docker-compose.all-in-one.yml up -d --build
```

## 🔄 Updates

To update the application:
```bash
git pull
docker-compose -f docker-compose.all-in-one.yml up -d --build
```

## 🐛 Troubleshooting

If something isn't working:
```bash
# Check container status
docker ps

# Check logs
docker-compose -f docker-compose.all-in-one.yml logs

# Check if ports are accessible
curl http://localhost/
curl http://localhost:3000/
```

## 🔒 Security Notes

- The container runs on ports 80 and 3000
- Make sure your firewall allows these ports
- Database is persisted in `./app/shipments.db`
- For production, consider adding SSL/HTTPS

## ✨ Features

- **User Authentication**: Register, login, JWT tokens
- **Multi-Location Support**: Manage multiple shipping origins
- **Carrier Integration**: FedEx, UPS, USPS credentials management
- **Token Generation**: Bearer tokens for carrier APIs
- **Modern UI**: React with Material-UI components
- **Responsive Design**: Works on desktop and mobile
