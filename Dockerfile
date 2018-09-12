FROM mhart/alpine-node:10 as build
WORKDIR /usr/src
COPY package.json ./
RUN yarn
COPY . .
RUN yarn run build && yarn --production

FROM mhart/alpine-node:base-10
WORKDIR /usr/src
ENV PATH="./node_modules/.bin:$PATH"
ENV NODE_ENV="production"
COPY --from=build /usr/src .
CMD NODE_ENV=production micro server.js
