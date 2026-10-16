# Use Node.js as the base image
FROM node:22-slim AS base

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:22-slim AS production
WORKDIR /app
COPY --from=base /app/dist ./dist
COPY --from=base /app/package.json ./
RUN npm install --omit=dev

# Install a simple static server
RUN npm install -g serve

# Expose the port
EXPOSE 3000

# Start the application
CMD ["serve", "-s", "dist", "-l", "3000"]
