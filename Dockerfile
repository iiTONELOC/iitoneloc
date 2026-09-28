# syntax=docker/dockerfile:1
# node:24-bookworm-slim, Node v24.21.0
FROM node@sha256:0e0ff40c39bc087845bfb27465a0df4ea419520094bc35842ff83dd8cbe6f9b6 AS base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json .npmrc ./
RUN npm ci --ignore-scripts

FROM deps AS build
COPY next.config.mjs postcss.config.mjs tailwind.config.ts tsconfig.json tsconfig.server.json tsconfig.worker.json ./
COPY server ./server
COPY src ./src
COPY public ./public
RUN npm run build \
  && test -s public/workers/globeWorker.js \
  && rm -rf .next/cache

FROM base AS prod-deps
COPY package.json package-lock.json .npmrc ./
RUN npm ci --omit=dev --ignore-scripts

FROM base AS runtime
RUN if getent passwd 712 || getent group 712; then \
      echo "UID or GID 712 is already in use" >&2; exit 1; \
    fi \
  && groupadd --system --gid 712 app \
  && useradd --system --uid 712 --gid 712 --home-dir /nonexistent \
       --no-create-home --shell /usr/sbin/nologin app
ENV NODE_ENV=production
COPY package.json app.json next.config.mjs ./
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
COPY --from=build /app/.next ./.next
RUN ln -s /tmp .next/cache
USER 712:712
CMD ["node", "dist/server/index.js"]
