FROM hub.docker.com/node:1.0.7

USER root

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

# Try to reduce the image size by clearing the yarn cache after install and using autoclean to remove unnnecessary bits in node_modules/
RUN yarn autoclean --init && \
    yarn install --production --pure-lockfile && \
    yarn cache clean

COPY dist ./dist
COPY src/views ./src/views

EXPOSE 3000

CMD ["yarn", "startProd"]