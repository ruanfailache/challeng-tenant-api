FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build && npm run prisma:generate

FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src/infrastructure/adapter/out/prisma/generated ./src/infrastructure/adapter/out/prisma/generated

EXPOSE 3000

CMD ["node", "dist/main"]