# secc - Distributed compiler with modern web technology.

a project of 'Second Compiler'.

## Key Features

- RESTful API in Daemon/Scheduler
- Preprocessed and Pump Mode
- Memory Cache(works like remote Ccache)
- Debug fission(-gsplit-dwarf option) supports.
- Monitoring by Browser(WebSocket)
- Cross-compile(Various version/machine of compiler in network) supports
- Gcc / Clang support

## How to use

install by git clone (then npm install)

```sh
git clone https://github.com/ivere27/secc.git
cd secc
npm install
```

make sure you've already installed node.js, npm and (optionally) redis
* Ubuntu $ sudo apt-get install nodejs npm nodejs-legacy redis-server
* Mac $ brew install nodejs redis


### Client

set PATH and NUMBER_OF_PROCESSORS(-jX)

```sh
export PATH=/path/to/secc/bin:$PATH
export NUMBER_OF_PROCESSORS="8"
```

set SECC_MODE = 1 or 2 (see below, Mode section)

```sh
export SECC_MODE=1
```

set SECC_CACHE if you want to use remote daemon's cache.

```sh
export SECC_CACHE=1
```

edit "client" part in 'settings.json' file.
set scheduler's address and port.

upload your compiler archive by ./tool/secc-upload-archive.js

gcc

```sh
node secc-upload-archive.js --gcc /path/to/gcc /path/to/g++ archivetool.js http://SCHEDULER:PORT
```

clang

```sh
node secc-upload-archive.js --clang /path/to/clang /path/to/clang++ archivetool.js http://SCHEDULER:PORT
```

in linux case(you can use the specific compiler version),

     node secc-upload-archive.js --gcc /usr/bin/gcc-5 /usr/bin/g++-5 ./secc-create-archive-linux.js http://172.17.42.1:10509

     node secc-upload-archive.js --clang /usr/bin/clang /usr/bin/clang++ ./secc-create-archive-linux.js http://172.17.42.1:10509

then, just use gcc as normal.

```sh
gcc -c test.c
```

#### Alternatives
* (experimental) [secc-shell](http://github.com/ivere27/secc-shell) - bash shell frontend
* (experimental) [secc-native](http://github.com/ivere27/secc-native) - native(c++) frontend

### Daemon

edit "daemon" part in 'settings.json' file.
set scheduler's address and port.

if you want to use cache, go #Caches section.

```sh
chmod a+w run
chmod a+w uploads
```

run 'node secc-daemon.js' as root for chroot-jail.

```sh
sudo DEBUG=secc* node secc-daemon.js
```

### Scheduler

```sh
sudo DEBUG=secc* node secc-scheduler.js
```

## Modes

MODE 1 - Preprocessed Mode(default)
  send one preprocessed source to daemon. (cause CPU load)

MODE 2 - Pump Mode
  send headers and source to daemon. (cause Memory/Bandwidth load)

MODE 3 - Git Mode(not yet supported.)

## Debug

use DEBUG=* to watch every verbose logs.
use DEBUG=secc* to watch only SECC's log.

```sh
DEBUG=* SECC_MODE=1 SECC_CACHE=1 /path/to/secc/bin/gcc -c test.c
```

## Caches

install REDIS in a daemon computer. then,
enable "cache" in "daemon" part of 'settings.json' file.

## How It Works
* Scheduler - RESTful/WebSocket/Monitoring WebServer
* Daemon - RESTful WebServer + WebSocket Client + Cache Server(redis)
* Client - http client

- (once) Client uploads a Compiler Archive to Scheduler
- Scheduler and Daemons are connected by WebSocket
- Client asks to Scheduler which daemon is available by REST API
- (Optional) Client tries to get caches if possible
- Client sends a source or/and dependencies to a Daemon by REST API
- (once) Daemon downloads the archive from Scheduler if not exists
- Daemon compiles the sources by Client's Compiler Archive
- Daemon responds to Client with a object(+@)
- (Optional) Objects are stored in Daemon's MemoryDB(redis)

## Scheduler's API

Verb | Endpoint | Note
--- | --- | ---
`GET` | / | Scheduler Monitor(HTML/JS)
`GET` | /archive | uploaded archive list
`GET` | /archive/{archiveId} | archive information of {archiveId}
`GET` | /archive/{archiveId}/file | download the compiler archive file
`DELETE` | /archive/{archiveId} | remove {archiveId} archive
`POST` | /archive | upload a new archive(used by tool/secc-upload-archive.js)
`GET` | /cache | cache metadata list
`DELETE` | /cache | clear all caches in Scheduler & Daemons
`GET` | /daemon | connected daemon list
`GET` | /job | working job list
`GET` | /job/new | request new job(used by secc.js client)

## Daemon's API

Verb | Endpoint | Note
--- | --- | ---
`GET` | /native/system | daemon's native compiler(installed)
`POST` | /compile/preprocessed/native | compile a preprocessed source by daemon's native compiler
`POST` | /compile/preprocessed/{archiveId} | compile a preprocessed source by {archiveId}(the archive is downloaded from Scheduler)
`POST` | /compile/pump/{archiveId}/{projectId}/filecheck | check dependency files whether already uploaded or not.
`POST` | /compile/pump/{archiveId}/{projectId} | compile a source with dependencies by {archiveId}(the archive is downloaded from Scheduler)
`GET` | /cache/{sourceHash}/{argvHash} | response the stored cache


# License

MIT