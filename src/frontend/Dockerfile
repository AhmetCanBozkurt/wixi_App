# ── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Bağımlılıklar ayrı katmanda — package değişmezse cache geçerli
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Build-time API URL: her ortam kendi URL'ini geçirir
ARG VITE_API_URL=http://localhost:5181/api/v1
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM nginx:alpine AS final

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget -qO- http://localhost/nginx-health || exit 1
