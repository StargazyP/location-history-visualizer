FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server.js ./
COPY ecosystem.config.js ./
COPY upload.html ./
COPY public ./public

RUN mkdir -p uploads data logs && chown -R node:node /app

USER node

ENV NODE_ENV=production
ENV PORT=3004

EXPOSE 3004

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
