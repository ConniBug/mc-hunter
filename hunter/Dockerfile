FROM ubuntu:latest

# Metadata
LABEL maintainer="Conni Bilham <me@conni.lgbt"
LABEL version="1.0"
LABEL description="Dockerfile for Hunter"

ENV NODE_VERSION=20.6.0
ENV NPM_VERSION=9.8.1

RUN apt-get -y update; apt-get -y install curl
RUN curl https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
ENV NVM_DIR=/root/.nvm

RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"
RUN node --version
RUN npm --version

RUN npm install -g pm2

# Copy files recursively from ./ to /app
COPY . /app
WORKDIR /app

# Install dependencies
RUN npm install

ENTRYPOINT ["node", "/app/hello.js"]
