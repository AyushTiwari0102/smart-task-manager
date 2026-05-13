# ================================================================
# Frontend Service Dockerfile
# Uses Nginx to serve static HTML/CSS/JS files
# ================================================================

# Use the official lightweight Nginx Alpine image
FROM nginx:1.25-alpine

# Remove the default nginx configuration
RUN rm /etc/nginx/nginx.conf

# Copy our custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy all static frontend source files into the nginx web root
COPY src/ /usr/share/nginx/html/

# Expose port 80 (the port nginx listens on inside the container)
EXPOSE 80

# Health check — makes sure nginx is still serving
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost/ || exit 1

# Nginx starts automatically as the default CMD in the base image
