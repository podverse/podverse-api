FROM node
WORKDIR /tmp
COPY . .
RUN yarn install