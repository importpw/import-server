FROM mhart/alpine-node:10.5.0
WORKDIR /app
COPY package.json .
RUN yarn install --production
COPY . .
USER nobody
CMD ["node", "./node_modules/.bin/micro", "server.js"]
