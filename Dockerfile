FROM dhi.io/node:25-debian13-dev AS builder

USER root
WORKDIR /app
RUN chown -R node:node /app

USER node
COPY --chown=node:node package*.json ./
RUN npm ci

COPY --chown=node:node . .
RUN npm run build

# Install production dependencies only
RUN rm -rf node_modules && npm ci --omit=dev

FROM dhi.io/node:25-debian13

WORKDIR /app
ENV NODE_ENV=production

# Copy production dependencies from builder (already installed)
COPY --chown=node:node --from=builder /app/build ./build
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/package*.json ./

USER node

EXPOSE 3000
CMD ["node", "build/index.js"]