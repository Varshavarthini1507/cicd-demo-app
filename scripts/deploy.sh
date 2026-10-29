#!/usr/bin/env bash
# Usage: deploy.sh <image> <container-name> <host-port>
# Pulls the new image, starts it, health-checks it and rolls back on failure.
set -euo pipefail

IMAGE="$1"; NAME="$2"; PORT="$3"
PREVIOUS=$(docker inspect --format '{{.Config.Image}}' "$NAME" 2>/dev/null || true)

docker pull "$IMAGE"
docker rm -f "$NAME" 2>/dev/null || true
docker run -d --name "$NAME" -p "$PORT":3000 --restart unless-stopped "$IMAGE"

echo "Waiting for health check..."
for i in $(seq 1 10); do
  if curl -fs "http://localhost:$PORT/health" >/dev/null; then
    echo "Deployment healthy: $IMAGE"
    exit 0
  fi
  sleep 3
done

echo "Health check FAILED. Rolling back..."
docker rm -f "$NAME" || true
if [ -n "$PREVIOUS" ]; then
  docker run -d --name "$NAME" -p "$PORT":3000 --restart unless-stopped "$PREVIOUS"
  echo "Rolled back to $PREVIOUS"
fi
exit 1
