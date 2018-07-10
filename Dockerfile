FROM mhart/alpine-node:10.6.0
WORKDIR /app
COPY package.json .
RUN yarn install --production && rm -rf ~/.npm* ~/.yarn*
COPY . .
USER nobody
EXPOSE 3000
CMD ["node", "./node_modules/.bin/micro", "server.js"]
