FROM node:18-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY package*.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build && pnpm prisma generate

FROM node:18-alpine AS runner

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src/infrastructure/adapter/out/prisma/generated ./src/infrastructure/adapter/out/prisma/generated

EXPOSE 3000

CMD ["node", "dist/main"]