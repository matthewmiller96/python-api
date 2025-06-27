# Frontend Deployment Guide

## 🚀 Deploy to Linux Server (10.0.0.108)

### Option 1: Static File Hosting

1. **Build the production version:**
   ```bash
   npm run build
   ```

2. **Copy the build folder to your Linux server:**
   ```bash
   # From your local machine
   scp -r build/ user@10.0.0.108:/var/www/shipping-api-frontend/
   ```

3. **On your Linux server, install and configure Nginx:**
   ```bash
   sudo apt update
   sudo apt install nginx

   # Create Nginx configuration
   sudo nano /etc/nginx/sites-available/shipping-frontend
   ```

4. **Nginx Configuration (/etc/nginx/sites-available/shipping-frontend):**
   ```nginx
   server {
       listen 80;
       server_name 10.0.0.108;  # Your server IP
       
       location / {
           root /var/www/shipping-api-frontend;
           index index.html index.htm;
           try_files $uri $uri/ /index.html;
       }
       
       # API proxy to your backend
       location /api/ {
           proxy_pass http://localhost:3000/;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

5. **Enable the site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/shipping-frontend /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### Option 2: Docker Deployment

1. **Create a Dockerfile for the frontend:**
   ```dockerfile
   # Build stage
   FROM node:18-alpine as build
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   # Production stage
   FROM nginx:alpine
   COPY --from=build /app/build /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Build and run:**
   ```bash
   docker build -t shipping-frontend .
   docker run -d -p 80:80 shipping-frontend
   ```

### Option 3: Quick Deploy Script

1. **Use the automated deployment script:**
   ```bash
   ./deploy.sh 10.0.0.108 root
   ```

### Option 4: Node.js Server

1. **Install serve globally on your server:**
   ```bash
   npm install -g serve
   ```

2. **Copy build folder and run:**
   ```bash
   serve -s build -l 3001
   ```

## Environment Configuration

The frontend is already configured to use your server:
```
REACT_APP_API_BASE_URL=http://10.0.0.108:3000
```

## Backend CORS Configuration

Make sure your FastAPI backend allows requests from your frontend domain:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://10.0.0.108", "http://10.0.0.108:80"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Access URLs

- **Frontend:** `http://10.0.0.108` (port 80) or `http://10.0.0.108:3001`
- **Backend:** `http://10.0.0.108:3000`

## Troubleshooting

Run the troubleshooting script on your server:
```bash
./troubleshoot.sh
```
