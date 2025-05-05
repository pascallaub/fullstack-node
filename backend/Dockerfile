# Use an official Node runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install app dependencies
RUN npm install
# If you are building your code for production
# RUN npm ci --omit=dev

# Bundle app source
COPY . .

# Default port the container will listen on
ARG PORT=3000
ENV PORT=${PORT}
EXPOSE ${PORT}

# Define the command to run your app
CMD [ "node", "server.js" ]