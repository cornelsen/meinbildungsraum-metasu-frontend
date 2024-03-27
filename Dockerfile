FROM nginx:alpine

ARG BUILD_NR=1
LABEL buildNr=${BUILD_NR}
ARG BUILD_TIMESTAMP
ARG BRANCH

LABEL branch=$BRANCH
LABEL buildNr=$BUILD_NR
LABEL buildTimestamp=$BUILD_TIMESTAMP

ENV API_URL='http://localhost'
ENV TZ=Europe/Berlin

RUN apk add jq
RUN rm -rf /etc/nginx/conf.d/*

ADD docker/nginx/entrypoint.sh /
ADD docker/nginx/*.template /etc/nginx/conf.d/

RUN chmod +x entrypoint.sh

COPY dist /app

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]