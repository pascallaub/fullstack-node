# Use an official Node runtime as a parent image
FROM node:lts-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json AND package-lock.json
# Using package-lock.json ensures reproducible installs
COPY package.json package-lock.json ./

# Install app dependencies using the lock file for consistency
# --omit=dev skips installing development dependencies
RUN npm ci --omit=dev

# Install curl
RUN apk add --no-cache curl

# Bundle app source
COPY . .

# Default port the container will listen on
ARG PORT=3000
ENV PORT=${PORT}
EXPOSE ${PORT}

# Define the command to run your app
CMD [ "node", "server.js" ]