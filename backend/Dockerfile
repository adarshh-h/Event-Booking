FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 5000

# Run migrations + seed + start server
CMD ["sh", "-c", "npx prisma migrate deploy && node prisma/seed.js && node server.js"]
