FROM node
WORKDIR /tmp
COPY . .
RUN npm install -g ts-node
RUN npm install
RUN ["chmod", "+x", "/tmp/src/scripts/stats/queryUniquePageviews.ts"]
RUN ["chmod", "+x", "/tmp/src/seeds/sampleEntities.ts"]
RUN npm run build
