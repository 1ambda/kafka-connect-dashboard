# Kafkalot

[![Build Status](https://travis-ci.org/1ambda/kafka-connect-dashboard.svg?branch=master)](https://travis-ci.org/1ambda/kafka-connect-dashboard) [![Coverage Status](https://coveralls.io/repos/github/1ambda/kafka-connect-dashboard/badge.svg?branch=master)](https://coveralls.io/github/1ambda/kafka-connect-dashboard?branch=master)

Centralize your [kafka-connect](http://kafka.apache.org/documentation.html#connect) instances 

- supports connect 0.10.0.0+
- shipped with dockerized images and the docker-compose file 
- compatibility with confluent platform 3.0.0
- easy connector instance life-cycle management with fancy UI ([screenshots](https://github.com/1ambda/kafka-connect-dashboard/wiki/Screenshots))
- easy config validation, management using [JSON Schema](http://json-schema.org/), [JSONEditor](https://github.com/josdejong/jsoneditor)

<br/>

Future Plans

- support [kafka-stream](http://kafka.apache.org/documentation.html#streams)
- real-time metrics for connect and stream

<br/>

## Demo

![Main](https://raw.githubusercontent.com/1ambda/kafka-connect-dashboard/screenshot/screenshots/main.png)

See more [screenshots](https://github.com/1ambda/kafka-connect-dashboard/wiki/Screenshots)

<br/>

## Usage

Kafkalot consist of 2 sub-projects

- *kafkalot-storage* (REST Server): persist configurations of connects and handling commands (start, validate, etc)  
- *kafkalot-ui* (SPA): provides view for managing connectors easily

### with Docker

Set these env variables before launching compose

> NOTE that a connect cluster should be in the same network otherwise kafkalot can't access

- `KAFKALOT_STORAGE_CONNECTOR_CLUSTERHOST`: kafka connect cluster host
- `KAFKALOT_STORAGE_CONNECTOR_CLUSTERPORT`: kafka connect cluster port

```shell
$ wget https://raw.githubusercontent.com/1ambda/kafka-connect-dashboard/master/docker-compose.yml

$ KAFKALOT_STORAGE_CONNECTOR_CLUSTERHOST=$CLUSTER_HOST \
  KAFKALOT_STORAGE_CONNECTOR_CLUSTERPORT=$CLUSTER_PORT \
  docker-compose up
```

If you do not have a connector cluster yet, use dockerized kafka and ZK

```shell
$ wget https://raw.githubusercontent.com/1ambda/kafka-connect-dashboard/master/docker-compose.yml
$ wget https://raw.githubusercontent.com/1ambda/kafka-connect-dashboard/master/with-kafka.yml

# env variables are already configured in `with-kafka.yml`
$ docker-compose -f docker-compose.yml -f with-kafka.yml up
```

See [docker-compose.yml](https://github.com/1ambda/kafka-connect-dashboard/blob/master/docker-compose.yml) and [with-kafka.yml](https://github.com/1ambda/kafka-connect-dashboard/blob/master/with-kafka.yml)

### without Docker (Not Recommended)

See [Running kafkalot without Docker](https://github.com/1ambda/kafka-connect-dashboard/wiki/Running-without-Docker)
