# Stage 1: Build the React application
FROM node:20-alpine AS build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Define ARG for API URL (can be overridden during build)
# Jetzt relativ, da Nginx als Proxy dient
ARG VITE_API_URL=/api
# Set ENV variable for the build process using the ARG value
ENV VITE_API_URL=${VITE_API_URL}

RUN echo "Building with API URL: ${VITE_API_URL}" # Log the API URL used during build
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:alpine

# Entferne die Standard-Nginx-Konfiguration
RUN rm /etc/nginx/conf.d/default.conf

# Kopiere unsere benutzerdefinierte Nginx-Konfiguration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Entferne default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Kopiere statische Assets vom Builder-Stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Containers run nginx with global directives and daemon off
CMD ["nginx", "-g", "daemon off;"]