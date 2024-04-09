FROM node:20-alpine

COPY . ./

RUN npm install --global http-server

CMD http-server --proxy http://localhost:8080?