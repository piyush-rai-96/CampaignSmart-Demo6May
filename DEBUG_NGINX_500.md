# Nginx 500 Error Debugging Guide

## Step 1: Check Nginx Error Logs (MOST IMPORTANT)
```bash
# SSH into your container/server and run:
tail -f /var/log/nginx/error.log

# Or view last 50 lines:
tail -n 50 /var/log/nginx/error.log
```

**This will tell you EXACTLY what's failing.**

Common errors you might see:
- `permission denied` → File permissions issue
- `no such file or directory` → Missing index.html or mime.types
- `failed to load` → Missing nginx modules
- `address already in use` → Port 8080 conflict

---

## Step 2: Verify Nginx Configuration Syntax
```bash
nginx -t
```

If this fails, the config has syntax errors. Fix them before proceeding.

---

## Step 3: Check Files Exist
```bash
# Check if index.html was deployed
ls -la /usr/share/nginx/html/

# Should show index.html and assets folder
# If empty or no index.html → build didn't copy files correctly
```

---

## Step 4: Check File Permissions
```bash
# Check ownership
ls -la /usr/share/nginx/html/

# Files should be owned by nginx:nginx with 755 permissions
# If not, run:
chown -R nginx:nginx /usr/share/nginx/html
chmod -R 755 /usr/share/nginx/html
```

---

## Step 5: Verify Nginx Is Running
```bash
# Check nginx process
ps aux | grep nginx

# Check what port nginx is listening on
netstat -tlnp | grep nginx
# Should show port 8080

# If nginx is not running:
nginx

# If it fails to start, check error log immediately
```

---

## Step 6: Test Config Files Are Loaded
```bash
# Check which config nginx is using
nginx -T | head -n 20

# Verify your configs are in place:
cat /etc/nginx/nginx.conf
cat /etc/nginx/conf.d/default.conf
```

---

## Step 7: Check MIME Types File
```bash
# This file MUST exist
ls -la /etc/nginx/mime.types

# If missing, nginx can't serve files correctly
```

---

## Step 8: Manual Test
```bash
# Inside the container, test nginx directly
curl -I http://localhost:8080

# Should return HTTP 200, not 500
# If 500, check error log immediately
```

---

## Common Root Causes:

### 1. **Nginx never restarted after config change**
```bash
# After copying configs, you MUST reload nginx:
nginx -s reload

# Or restart:
nginx -s stop && nginx
```

### 2. **Missing /etc/nginx/mime.types**
Your container might be missing this file. Add to your Dockerfile:
```dockerfile
COPY /path/to/mime.types /etc/nginx/mime.types
```

### 3. **Index.html not built or copied**
```bash
# Verify build output exists:
ls -la /usr/share/nginx/html/index.html
```

### 4. **Port conflict**
```bash
# Check if something else is using port 8080:
lsof -i :8080
```

---

## Quick Fix Test

Try this minimal config to isolate the issue:

**Replace /etc/nginx/conf.d/default.conf with:**
```nginx
server {
    listen 8080;
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri /index.html;
    }
}
```

Then:
```bash
nginx -t && nginx -s reload
tail -f /var/log/nginx/error.log
```

---

## What to Send Me

Run these commands and send me the output:
```bash
# 1. Error log
tail -n 50 /var/log/nginx/error.log

# 2. Directory listing
ls -la /usr/share/nginx/html/

# 3. Nginx test
nginx -t

# 4. Nginx processes
ps aux | grep nginx

# 5. Curl test
curl -v http://localhost:8080
```

This will tell us EXACTLY what's wrong.
