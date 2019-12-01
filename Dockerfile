FROM node:10
WORKDIR /tmp
COPY . .
RUN npm install -g ts-node@8.5.4
RUN npm install
