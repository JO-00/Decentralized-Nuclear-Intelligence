FROM node:22-alpine AS builder
WORKDIR /app


COPY package*.json ./
RUN npm install

COPY . .
RUN npx vite build
FROM nginx:1.25-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 5173

CMD ["nginx" , "-g" , "daemon off;"]