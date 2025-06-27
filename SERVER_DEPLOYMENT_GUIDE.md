# Server Deployment Guide

## 🚀 Deploying Your Updated Python API to Server

### Step 1: Connect to Your Server
```bash
ssh your-username@your-server-ip
```

### Step 2: Navigate to Your Project Directory
```bash
cd /path/to/your/python-api-project
```

### Step 3: Pull Latest Changes
```bash
git pull origin main
```

### Step 4: Deploy in Production Mode
```bash
# Deploy with frontend and API
./deploy.sh production

# OR deploy API only for development
./deploy.sh development

# OR deploy everything in one container
./deploy.sh all-in-one
```

### Step 5: Verify Deployment
```bash
# Check container status
./utils.sh status

# Test connectivity
./utils.sh test-connectivity

# View access URLs
./utils.sh urls

# Check logs if needed
./utils.sh logs api
```

## 🔧 Testing on Server

### Quick API Test
```bash
# Test health endpoint
curl http://localhost:3000/health

# Test API root
curl http://localhost:3000/

# View API documentation
# Open browser to: http://your-server-ip:3000/docs
```

### User Authentication Test
```bash
# Register a test user
curl -X POST "http://localhost:3000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "servertest",
    "email": "test@server.com", 
    "password": "serverpass123",
    "full_name": "Server Test User"
  }'

# Login to get token
curl -X POST "http://localhost:3000/auth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=servertest&password=serverpass123"
```

## 📊 Monitoring

### Check Container Status
```bash
docker ps
docker-compose ps
```

### View Logs
```bash
# API logs
./utils.sh logs api

# All logs
./utils.sh logs all

# Follow logs in real-time
docker-compose logs -f
```

### System Resources
```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top
```

## 🌐 Network Access

After deployment, your API will be accessible at:

- **Local (on server)**: http://localhost:3000
- **Internal Network**: http://your-server-ip:3000  
- **External (if port forwarded)**: http://your-public-ip:3000

## 🔐 Security Considerations

### Firewall Settings
```bash
# Allow port 3000 through firewall
sudo ufw allow 3000

# Check firewall status
sudo ufw status
```

### SSL/HTTPS (Recommended for Production)
Consider setting up a reverse proxy with Nginx and SSL certificates for production use.

## 🛠 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Stop existing containers
   ./deploy.sh development
   docker-compose down --remove-orphans
   ```

2. **Permission Issues**
   ```bash
   # Make scripts executable
   chmod +x deploy.sh utils.sh
   ```

3. **Database Issues**
   ```bash
   # Check database file permissions
   ls -la shipments.db
   ```

4. **Container Build Issues**
   ```bash
   # Force rebuild
   docker-compose build --no-cache
   ```

### Get Help
```bash
# Run troubleshooting diagnostics
./utils.sh troubleshoot

# Check all available utilities
./utils.sh help
```

## ✅ Success Indicators

You'll know the deployment is successful when:

1. ✅ `./utils.sh status` shows containers running
2. ✅ `curl http://localhost:3000/health` returns `{"status":"healthy"}`
3. ✅ API documentation accessible at `http://your-server-ip:3000/docs`
4. ✅ User registration and authentication working
5. ✅ No errors in `./utils.sh logs api`

## 🎉 Next Steps

After successful deployment:

1. **Test User Authentication**: Create test users and verify JWT tokens
2. **Configure Carrier Credentials**: Add real carrier API credentials
3. **Test Carrier Integration**: Verify token generation with carriers
4. **Set Up Monitoring**: Consider log monitoring and alerting
5. **Configure Backups**: Regular database backups
6. **SSL Setup**: Configure HTTPS for production use
