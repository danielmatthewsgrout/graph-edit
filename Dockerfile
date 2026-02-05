FROM node:22-slim AS builder

USER root

WORKDIR /app

RUN npm install -g pnpm
RUN chown -R node:node /app

USER node

ENV CI=true

COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY --chown=node:node . .

RUN pnpm prepare
RUN pnpm build

FROM node:22-slim

WORKDIR /app
ENV NODE_ENV=production

COPY --chown=node:node --from=builder /app/build ./build
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/pnpm-lock.yaml ./

USER node

EXPOSE 3000
CMD ["node", "build/index.js"]
