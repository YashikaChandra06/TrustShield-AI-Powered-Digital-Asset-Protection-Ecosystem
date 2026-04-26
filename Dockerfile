FROM node:20-alpine

WORKDIR /app

# Copy package.json files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd client && npm install

# Copy application files
COPY . .

# Build the frontend
RUN cd client && npm run build

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "src/server.js"]
