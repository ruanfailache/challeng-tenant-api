FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY . .
RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY scripts/docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER nodejs

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]