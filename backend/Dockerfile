# syntax=docker/dockerfile:1.7

FROM oven/bun:1.3.10-alpine AS deps
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install

FROM oven/bun:1.3.10-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json bun.lock* ./
RUN bun install --production
COPY tsconfig.json ./tsconfig.json
COPY src ./src
COPY views ./views
COPY public ./public
RUN mkdir -p public/uploads/images public/uploads/audio public/uploads/docs \
  && chown -R bun:bun /app
USER bun
EXPOSE 3001
CMD ["bun", "run", "start"]
