# memtier-benchmark-api

RESTful wrapper to [memtier_benchmark](https://github.com/RedisLabs/memtier_benchmark) (A memcache/redis NoSQL traffic generator and performance benchmarking tool.
) in a docker container.

## Setup
To run it:
```
docker run -p 3000:80 -d --name mtb-api pafmon/memtier-benchmark-api
```

## Usage
In order to use it, send a request to ``/redis/{host}/{port}/{db}/memtier_benchmark/opt1/opt2/....``.

### Quick start guide

We will use a redis running in ``172.17.0.2`` (Inside the internal docker network), in port ``6379``, the following ewquest will generate a benchmark test in DB ``15`` (**flushing the data before the test**):

1. Run a redis container in exposing its default port ``6379``.
```
docker run -d --name redis -p 6379:6379 redis
```
2. Obtain its IP address in the internal docker network.  
```
docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' redis

```
We will get something like this:
```
172.17.0.2
```
3. Run memtier-benchmark-api
```
docker run -p 3000:80 -d --name mtb-api pafmon/memtier-benchmark-api
```
4. Run the test with the appropriate IP and Port (``172.17.0.2`` and ``6379`` in our example):
```
curl localhost:3000/redis/172.17.0.2/6379/15/memtier_benchmark/-R/-n/1/-d/100 > result.json
```
It should create a file result.json with the results of the benchmark execution:

```
{
    "out": [
        "4         Threads",
        "50        Connections per thread",
        "1         Requests per client",
        "",
        "",
        "ALL STATS",
        "=========================================================================",
        "Type         Ops/sec     Hits/sec   Misses/sec      Latency       KB/sec ",
        "-------------------------------------------------------------------------",
        "Sets        12235.41          ---          ---      9.85800      1768.40 ",
        "Gets            0.00         0.00         0.00      0.00000         0.00 ",
        "Waits           0.00          ---          ---      0.00000          --- ",
        "Totals      12235.41         0.00         0.00      9.85800      1768.40 ",
        "",
        "",
        "Request Latency Distribution",
        "Type     <= msec         Percent",
        "------------------------------------------------------------------------",
        "SET       5.700         0.50",
        "SET       5.800         2.00",
        "SET       5.900         3.50",
        "SET       6.000         5.50",
        "SET       6.100         8.50",
        "SET       6.200         9.00",
        "SET       6.300        11.00",
        "SET       6.400        12.50",
        "SET       6.500        13.50",
        "SET       6.600        14.50",
        "SET       6.700        16.00",
        "SET       6.800        16.50",
        "SET       6.900        17.50",
        "SET       7.000        18.00",
        "SET       9.300        18.50",
        "SET       9.400        19.00",
        "SET       9.500        22.50",
        "SET       9.600        24.00",
        "SET       9.700        30.00",
        "SET       9.800        37.50",
        "SET       9.900        56.00",
        "SET      10.000        63.00",
        "SET      11.000        70.50",
        "SET      12.000        99.00",
        "SET      13.000       100.00",
        "---",
        "---"
    ],
    "log": [
        "[RUN #1] Preparing benchmark client...",
        "[RUN #1] Launching threads now...",
        "[RUN #1 100%,   0 secs]  0 threads:         200 ops,       0 (avg:   12955) ops/sec, 0.00KB/sec (avg: 1.83MB/sec),  0.00 (avg:  9.86) msec latency",
        ""
    ],
    "duration": 1034.781
}
```

## Memtier_benchmark Options

The ``hostname``, ``port`` and ``database`` are passed through the first elements in the path, the rest of options available are:

### Connection and General Options:
```
  -P, --protocol=PROTOCOL        Protocol to use (default: redis).  Other
                                 supported protocols are memcache_text,
                                 memcache_binary.
  -x, --run-count=NUMBER         Number of full-test iterations to perform
  -D, --debug                    Print debug output
      --show-config              Print detailed configuration before running
```
### Test Options
```
  -n, --requests=NUMBER          Number of total requests per client (default: 10000)
  -c, --clients=NUMBER           Number of clients per thread (default: 50)
  -t, --threads=NUMBER           Number of threads (default: 4)
      --test-time=SECS           Number of seconds to run the test
      --ratio=RATIO              Set:Get ratio (default: 1:10)
      --pipeline=NUMBER          Number of concurrent pipelined requests (default: 1)
      --reconnect-interval=NUM   Number of requests after which re-connection is performed
      --multi-key-get=NUM        Enable multi-key get commands, up to NUM keys (default: 0)
  -a, --authenticate=PASSWORD    Authenticate to redis using PASSWORD
```
### Object Options
```
  -d  --data-size=SIZE           Object data size (default: 32)
  -R  --random-data              Indicate that data should be randomized
      --data-size-range=RANGE    Use random-sized items in the specified range (min-max)
      --data-size-list=LIST      Use sizes from weight list (size1:weight1,..sizeN:weightN)
      --expiry-range=RANGE       Use random expiry values from the specified range
```
### Key Options
```

      --key-prefix=PREFIX        Prefix for keys (default: memtier-)
      --key-minimum=NUMBER       Key ID minimum value (default: 0)
      --key-maximum=NUMBER       Key ID maximum value (default: 10000000)
      --key-pattern=PATTERN      Set:Get pattern (default: R:R)

      --help                     Display this help
      --version                  Display version information
```
For more details on memtier_benchmark go to [guide](https://redislabs.com/blog/memtier_benchmark-a-high-throughput-benchmarking-tool-for-redis-memcached/) or its [main page](https://github.com/RedisLabs/memtier_benchmark)


