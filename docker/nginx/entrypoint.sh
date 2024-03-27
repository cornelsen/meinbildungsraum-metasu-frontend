#!/usr/bin/env sh
set -eu

echo "Will proxy requests for /api to ${API_URL}"
envsubst '${API_URL}' < /etc/nginx/conf.d/nep.template > /etc/nginx/conf.d/nep.conf

exec "$@"