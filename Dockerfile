FROM node:8.3.0-alpine

RUN apk add --update alpine-sdk git libpng-dev libc6-compat

RUN git clone http://github.com/google/guetzli.git/

RUN cd guetzli && make

RUN mv /guetzli/bin/Release/guetzli /usr/local/bin/guetzli && rm -rf /guetzli

WORKDIR /src

COPY package.json .

RUN npm i

ADD . .

CMD ["npm", "start"]
