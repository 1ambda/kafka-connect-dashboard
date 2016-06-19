# Kafkalot 

[![Build Status](https://travis-ci.org/1ambda/kafka-connect-dashboard.svg?branch=master)](https://travis-ci.org/1ambda/kafka-connect-dashboard) [![Coverage Status](https://coveralls.io/repos/github/1ambda/kafka-connect-dashboard/badge.svg?branch=master)](https://coveralls.io/github/1ambda/kafka-connect-dashboard?branch=master)

Centralize your [kafka-connect](http://kafka.apache.org/documentation.html#connect) instances 

- supports connect 0.10.0.0+

<br/>

## Demo

![DEMO](https://raw.githubusercontent.com/1ambda/kafka-connect-dashboard/screenshot/screenshots/kafkalot-demo.png)

## Usage

Download [the latest release](https://github.com/1ambda/kafka-connect-dashboard/releases) and unzip it 

<br/>

Kafkalot consist of 2 subprojects

- *kafkalot-storage* (API Server): persist configurations of connects and handling commands (start, validate, etc)  
- *kafkalot-ui* (SPA): provides view for managing connectors easily 

### Running kafkalot-storage

- **Java 8+** is required
- **Mongo 3.10+** is required
- **Kafka connector cluster** is required

```shell
$ # configure `conf/application.conf`, `conf/logback.xml` before starting storage

$ cd kafkalot/storage
$ ./bin/kafkalot-storage
```

### Running kafkalot-ui

- **Web Server** is required

Serve static files in `dist/ui` in your web server

<br/>

For example, (prepare [browser-sync](https://www.browsersync.io/) globally before executing this command)
 
```shell
$ cd kafkalot/ui
$ browser-sync start --server --files "*.*"
```

## Development

- **NodeJS 5.0.0+** is required
- **Java 8+** is required

### Build

```shell
$ ./build.sh ${VERSION_NO}  # e.g 0.0.1
```
 
### Test

#### kafkalot-storage

```shell
$ sbt "project kafkalot-storage" "test"
```

#### kafkalot-ui

```shell
$ cd kafkalot-ui
$ npm run test
```

