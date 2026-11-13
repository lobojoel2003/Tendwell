# syntax=docker/dockerfile:1

# Tendwell: a gentle guide after a death.
# Build:  docker build -t tendwell .
# Run:    docker run -p 3000:3000 -v tendwell-data:/data -e ORIGIN=http://localhost:3000 tendwell

ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
# better-sqlite3 ships prebuilt binaries for Linux (glibc and musl, x64 and arm64),
# so nothing needs compiling and install scripts can be skipped.
RUN npm ci --ignore-scripts
COPY . .
ARG TENDWELL_VERSION=""
ARG BUILD_NUMBER="docker"
ARG GIT_COMMIT="unknown"
RUN TENDWELL_VERSION="${TENDWELL_VERSION}" BUILD_NUMBER="${BUILD_NUMBER}" GIT_COMMIT="${GIT_COMMIT}" npm run build \
	&& npm prune --omit=dev \
	&& rm -rf node_modules/better-sqlite3/deps node_modules/better-sqlite3/src \
		node_modules/better-sqlite3/prebuilds/darwin-* node_modules/better-sqlite3/prebuilds/win32-*

FROM node:${NODE_VERSION}-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
	PORT=3000 \
	DATABASE_PATH=/data/tendwell.db
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY --from=build /app/scripts/reset-password.js ./scripts/reset-password.js
RUN mkdir -p /data && chown node:node /data
USER node
VOLUME ["/data"]
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
	CMD ["node", "-e", "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/healthz').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]
CMD ["node", "build"]
