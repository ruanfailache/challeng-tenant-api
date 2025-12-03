FROM node:22-alpine

RUN apk add --no-cache aws-cli curl

WORKDIR /app

COPY package*.json ./
RUN npm ci && npm cache clean --force

COPY . .

COPY scripts/docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]