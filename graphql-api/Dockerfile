FROM node:latest as build
RUN mkdir -p /home/node/haikubot-api/node_modules && chown -R node:node /home/node/haikubot-api
WORKDIR /home/node/haikubot-api
COPY package*.json ./
USER node
RUN npm install
COPY --chown=node:node . .

FROM node:slim as final
WORKDIR /home/node/haikubot-api
COPY --from=build --chown=node:node /home/node/haikubot-api /home/node/haikubot-api
EXPOSE 4000
CMD [ "npm", "start" ]
