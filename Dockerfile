FROM node:20-alpine AS build

# Build frontend
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Build backend
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY src/ ./src/
COPY --from=build /app/client/dist ./client/dist

# Ensure the database directory exists and is writable
RUN mkdir -p ./src/db
# We might need sqlite3 installed, it's in dependencies

# Set environment to production
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "src/server.js"]
