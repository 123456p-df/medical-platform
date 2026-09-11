FROM node:24-alpine AS frontend
RUN npm install --global pnpm@11.25.0
WORKDIR /frontend
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY index.html tsconfig*.json vite.config.ts ./
COPY public/ ./public/
COPY src/ ./src/
RUN pnpm build

FROM nginx:1.28-alpine
COPY --from=frontend /frontend/dist /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/nginx.conf
