FROM node:20
WORKDIR /opt
COPY ../helpers ./helpers
COPY ../orm ./orm
COPY ../parser ./parser
COPY ../queue ./queue
COPY ../workers ./workers

WORKDIR /opt/workers
RUN npm install
RUN npm run build
