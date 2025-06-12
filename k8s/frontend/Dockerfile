# Multi-Stage Build für React/Vite App

# ==============================
# STAGE 1: Build Environment
# ==============================
FROM node:18-alpine AS builder

# Arbeitsverzeichnis setzen
WORKDIR /app

# Package-Dateien kopieren (für besseres Caching)
COPY package*.json ./

# Nur production dependencies installieren
RUN npm ci --only=production

# Quellcode kopieren
COPY . .

# Build-Argument für API-URL (kann bei CI überschrieben werden)
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Anwendung bauen
RUN npm run build

# ==============================
# STAGE 2: Production Environment
# ==============================
FROM nginx:alpine AS runner

# Nginx-Konfiguration für SPA-Routing
RUN rm -rf /etc/nginx/conf.d/*
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

# Build-Artefakte von Builder-Stage kopieren
COPY --from=builder /app/dist /usr/share/nginx/html

# Port exponieren
EXPOSE 80

# Health Check hinzufügen
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost/ || exit 1

# Container starten
CMD ["nginx", "-g", "daemon off;"]