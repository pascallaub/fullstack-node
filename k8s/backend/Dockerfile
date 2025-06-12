# Multi-Stage Build für Node.js Backend

# ==============================
# STAGE 1: Dependencies
# ==============================
FROM node:18-alpine AS builder

WORKDIR /app

# Package files kopieren
COPY package*.json ./

# Dependencies installieren
RUN npm ci --only=production

# ==============================
# STAGE 2: Production
# ==============================
FROM node:18-alpine AS runner

# Security: Non-root User erstellen
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

WORKDIR /app

# Nur production dependencies kopieren
COPY --from=builder /app/node_modules ./node_modules

# Application code kopieren
COPY . .

# Dem non-root user Rechte geben
RUN chown -R nodeuser:nodejs /app

# User wechseln
USER nodeuser

# Port exponieren
EXPOSE 3000

# Health Check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost:3000/api/health || exit 1

# Anwendung starten
CMD ["node", "server.js"]