# Router Port Forwarding Configuration Guide

## Overview
To allow external access to your FastAPI application, you need to configure port forwarding on your router. This will forward incoming traffic on port 3000 to your server.

## Step-by-Step Instructions

### 1. Find Your Router's Admin Interface
- Open a web browser
- Navigate to your router's IP address (usually one of these):
  - `192.168.1.1`
  - `192.168.0.1`
  - `10.0.0.1`
  - `192.168.1.254`
- Login with your router's admin credentials

### 2. Locate Port Forwarding Settings
Look for one of these menu items:
- "Port Forwarding"
- "Virtual Server"
- "Port Mapping"
- "Applications & Gaming"
- "Advanced" → "Port Forwarding"

### 3. Configure Port Forwarding Rule
Create a new rule with these settings:

| Setting | Value |
|---------|--------|
| **Rule Name** | FastAPI-Server |
| **External Port** | 3000 |
| **Internal IP** | [Your server's local IP] |
| **Internal Port** | 3000 |
| **Protocol** | TCP |
| **Status** | Enabled |

### 4. Find Your Server's Internal IP
Run this command on your server to find the internal IP:
```bash
hostname -I | cut -d' ' -f1
```

Or check in your router's DHCP client list.

### 5. Save and Apply Settings
- Save the port forwarding rule
- Some routers require a restart to apply changes

## Common Router Interfaces

### Netgear
- Advanced → Dynamic DNS/Port Forwarding → Port Forwarding

### Linksys
- Smart Wi-Fi Tools → Port Range Forwarding

### ASUS
- Advanced Settings → WAN → Virtual Server/Port Forwarding

### TP-Link
- Advanced → NAT Forwarding → Virtual Servers

### D-Link
- Advanced → Port Forwarding

## Testing
After configuration, test using:
```bash
./test-connectivity.sh
```

Or manually test from another network:
```bash
curl http://[YOUR_PUBLIC_IP]:3000/
```

## Security Considerations
- Only forward the specific port (3000) you need
- Consider setting up a firewall on your server
- Monitor access logs for suspicious activity
- Use HTTPS in production (consider using a reverse proxy like Nginx)

## Troubleshooting

### External Access Still Fails
1. **Double-check port forwarding rule**
   - Ensure internal IP is correct
   - Verify port numbers match (3000 → 3000)
   - Confirm protocol is TCP

2. **Check ISP restrictions**
   - Some ISPs block common ports
   - Try a different external port (e.g., 8080, 9000)

3. **Verify server firewall**
   ```bash
   # Check if port 3000 is open
   sudo netstat -tlnp | grep :3000
   
   # If using UFW firewall
   sudo ufw allow 3000
   ```

4. **Test from external network**
   - Use mobile data or ask friend to test
   - Local network tests won't verify external access

### Dynamic IP Issues
If your public IP changes frequently:
- Consider using a Dynamic DNS service (DuckDNS, No-IP)
- Update your DNS records when IP changes

## Alternative Solutions

### Cloudflare Tunnel (Recommended for Production)
- No port forwarding needed
- Built-in security and DDoS protection
- Free tier available

### Reverse Proxy (Advanced)
- Use Nginx or Traefik
- Handle SSL/TLS termination
- Load balancing capabilities
