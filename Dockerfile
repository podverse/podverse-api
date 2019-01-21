FROM node
WORKDIR /tmp
COPY . .
RUN npm install
RUN ["chmod", "+x", "/tmp/src/scripts/stats/queryUniquePageviews.ts"]
RUN tsc
CMD ["node", "./dist/server.js"]