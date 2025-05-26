# Use an official Node.js runtime as a parent image
FROM node:lts-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install app dependencies
RUN npm ci

# Bundle app source
COPY . .

# Make port 3000 available to the world outside this container
# This is informational; the actual port is set by the PORT env var in server.js
EXPOSE 3000

# Define environment variable for the port (can be overridden)
ENV PORT=3000

# Run the app when the container launches
CMD ["node", "server.js"]
