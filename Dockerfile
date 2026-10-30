# syntax=docker/dockerfile:1@sha256:4edf897a3ffa55b89f906fc8cc78afdb3f1834cc9c7083565e611a8a7d5fe99e
# node:24.22.2-bookworm-slim, Node v24.22.2
FROM node@sha256:c86ecead9e55a5210ac1727de38a4ca840bf03dcaf34dc9749addbf383b1920c AS base
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
  && rm -rf .next/cache \
  && ln -s /tmp .next/cache

FROM base AS prod-deps
COPY package.json package-lock.json .npmrc ./
RUN npm ci --omit=dev --ignore-scripts \
  && rm -rf node_modules/@next/swc-*

FROM base AS node-runtime
ADD --checksum=sha256:361718c444e49af2ca5a110c83ba6a8901143f23ab285ebbef0341f391f482a9 https://nodejs.org/dist/v24.22.2/node-v24.22.2-linux-x64.tar.gz /tmp/node.tar.gz
RUN tar -xzf /tmp/node.tar.gz -C /tmp node-v24.22.2-linux-x64/bin/node \
  && mkdir -p /out/usr/local/bin /out/etc \
  && cp /tmp/node-v24.22.2-linux-x64/bin/node /out/usr/local/bin/node \
  && chmod 0755 /out/usr/local/bin/node \
  && : > /out/etc/machine-id

FROM cgr.dev/chainguard/glibc-dynamic@sha256:709673274b417a48f56374da8a7633ef7b2f5b27e34612ce98a335737318cc94 AS runtime
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
WORKDIR /app
COPY --from=node-runtime /out/ /
COPY package.json app.json next.config.mjs ./
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
COPY --from=build /app/.next ./.next
USER 712:712
ENTRYPOINT ["/usr/local/bin/node"]
CMD ["dist/server/index.js"]
