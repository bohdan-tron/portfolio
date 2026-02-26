# Docker

Install docker by following https://docs.docker.com/engine/install/ubuntu/

docker-compose up -d --build

docker-compose down --rmi all
docker-compose up -d --build --force-recreate

docker-compose stop
docker-compose down
docker-compose down --rmi all

docker-compose ps
docker-compose logs -f

## How to test websocket connection

pnpm add -g wscat
pnpm run dev:pretty

wscat -c ws://localhost:1337
Send json: {"type":"create-room","payload":{"playerName":"TestPlayer","maxPlayers":6}}