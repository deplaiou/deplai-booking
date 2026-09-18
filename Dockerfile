# Deplai booking demo. Coolify: build pack "Dockerfile", port 3000, volume mounted at /data.
FROM node:22-alpine AS build
WORKDIR /app
# better-sqlite3 is a native module: build tools are needed at install time only.
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    NUXT_DATABASE_PATH=/data/booking.db
COPY --from=build /app/.output ./.output
RUN mkdir -p /data
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
