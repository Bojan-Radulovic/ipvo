# Build step #1: build the React frontend
FROM node:16-alpine as build-step
WORKDIR /app
COPY app-react/package*.json ./
COPY app-react/src ./src
COPY app-react/public ./public
RUN yarn install
RUN yarn build

# Build step #2: build an nginx container
FROM nginx:stable-alpine
COPY --from=build-step /app/build /usr/share/nginx/html
COPY app-react/nginx.default.conf /etc/nginx/conf.d/default.conf