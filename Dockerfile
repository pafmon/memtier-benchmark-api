
FROM redislabs/memtier_benchmark:1.3.0
FROM node:10

COPY --from=0 /usr/local/bin/memtier_benchmark .
COPY --from=0 /usr/lib/x86_64-linux-gnu/libevent-2.1.so.6.0.2  /usr/lib/x86_64-linux-gnu/libevent-2.1.so.6
COPY --from=0 /usr/lib/x86_64-linux-gnu/libevent_openssl-2.1.so.6.0.2 /usr/lib/x86_64-linux-gnu/libevent_openssl-2.1.so.6


COPY package*.json ./
COPY *.js ./

RUN npm install

EXPOSE 80

ENTRYPOINT ["node","index.js"]

