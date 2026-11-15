# 1단계: React 빌드
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# 2단계: Nginx 실행 환경
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# 기본 Nginx 서버 설정 교체
COPY nginx.conf /etc/nginx/conf.d/default.conf


EXPOSE 80