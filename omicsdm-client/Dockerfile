#build environment
# FROM node:13.12.0-alpine as build
# FROM node:18.14.0-alpine as build
FROM node:23-alpine3.20 as build
# RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

#ARG IGNORE_CACHE_FROM_HERE=unknown
#RUN echo "IGNORE_CACHE_FROM_HERE=${IGNORE_CACHE_FROM_HERE}"
# COPY package.json pnpm-lock.yaml ./
# RUN pnpm install --frozen-lockfile --prod
COPY package.json package-lock.json ./
RUN npm ci --production --legacy-peer-deps

#ARG IGNORE_CACHE_FROM_HERE=unknown
#RUN echo "IGNORE_CACHE_FROM_HERE=${IGNORE_CACHE_FROM_HERE}"
COPY . .
# RUN pnpm run build
RUN npm install -D webpack-cli --legacy-peer-deps
RUN npm run build

#production environment
FROM nginx:1.23-alpine
RUN apk add openssl
EXPOSE 80 
COPY --from=build /app/build /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
