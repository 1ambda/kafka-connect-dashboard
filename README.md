# Kafkalot 

[![Build Status](https://travis-ci.org/1ambda/kafka-connect-dashboard.svg?branch=master)](https://travis-ci.org/1ambda/kafka-connect-dashboard) [![Coverage Status](https://coveralls.io/repos/github/1ambda/kafka-connect-dashboard/badge.svg?branch=master)](https://coveralls.io/github/1ambda/kafka-connect-dashboard?branch=master)

Centralize your [kafka-connect](http://kafka.apache.org/documentation.html#connect) instances 

- supports connect 0.10.0.0+
- **real-time** config validation using [JSON Schema](http://json-schema.org/)
- config management with [JSONEditor](https://github.com/josdejong/jsoneditor)

## Demo

![DEMO](https://raw.githubusercontent.com/1ambda/kafka-connect-dashboard/screenshot/screenshots/kafkalot-demo.png)

## Usage

Kafkalot consist of 2 subprojects

- *kafkalot-storage* (API Server): persist configurations of connects and handling commands (start, validate, etc)  
- *kafkalot-ui* (SPA): provides view for managing connectors easily 

### with Docker

```
$ mkdir kafkalot-compose && cd kafkalot-compose
$ wget https://raw.githubusercontent.com/1ambda/kafka-connect-dashboard/master/docker-compose.yml
$ wget https://raw.githubusercontent.com/1ambda/kafka-connect-dashboard/master/with-kafka.yml

# if you have a connector cluster
$ KAFKALOT_STORAGE_CONNECTOR_CLUSTERHOST=$CLUSTER_HOST \ 
  KAFKALOT_STORAGE_CONNECTOR_CLUSTERPORT=$CLUSTER_PORT \  
  docker-compose up
  
# if you do not have a connector cluster, kafka, zookeeper
$ docker-compose -f docker-compose.yml -f with-kafka.yml
```

See [docker-compose.yml](https://github.com/1ambda/kafka-connect-dashboard/blob/master/docker-compose.yml) and [with-kafka.yml](https://github.com/1ambda/kafka-connect-dashboard/blob/master/with-kafka.yml)
 
### without Docker 

See [Running kafkalot without Docker](https://github.com/1ambda/kafka-connect-dashboard/wiki/Running-without-Docker)
