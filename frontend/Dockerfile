# Build stage (production build)
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build the production-ready static files
RUN npm run build

# Runtime stage (serve built assets)
FROM node:22-alpine AS runtime

WORKDIR /app

# Install a simple static file server that supports SPA routing
RUN npm install -g serve

# Copy built assets from the build stage
COPY --from=build /app/dist ./dist

# Expose the port that "serve" will use
EXPOSE 4173

# Serve the built app
CMD ["serve", "-s", "dist", "-l", "4173"]

# Dev stage (Vite dev server)
FROM node:22-alpine AS dev

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
