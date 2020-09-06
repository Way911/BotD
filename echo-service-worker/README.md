# BotD
`BotD` means a *bot* framework template wth *D*istribution capability

## Install

```shell
npm i
```

## Run

```shell
# start broker
docker-compose -p redis up -d

# start inbound/outbound services
npm start 

# start worker service
npm run start-worker
```

## Test
Use Bot framework emulator to test