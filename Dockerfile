FROM node:20-slim

WORKDIR /opt
COPY . .

RUN npm install
RUN npm run build
