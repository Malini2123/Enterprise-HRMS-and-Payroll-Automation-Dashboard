# ---- Build stage ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# ---- Production stage ----
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app .

EXPOSE 5000

CMD ["node", "server.js"]