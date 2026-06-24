FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build the React app
RUN npm run build

# Serve with nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# nginx config to handle React Router (client-side routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
