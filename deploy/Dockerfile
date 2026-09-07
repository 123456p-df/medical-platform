FROM node:24-alpine AS frontend
RUN npm install --global pnpm@11.25.0
WORKDIR /frontend
COPY medical-platform/Medical/package.json medical-platform/Medical/pnpm-lock.yaml medical-platform/Medical/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY medical-platform/Medical/ ./
RUN pnpm build

FROM nginx:1.28-alpine
COPY --from=frontend /frontend/dist /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/nginx.conf
