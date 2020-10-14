const redis = require("redis");
const { spawn } = require('child_process');
const readline = require('readline');

const express = require('express');
const app = express();
var port = process.env.PORT || 80;
 
function processRequest(host, port, db, options, res){

    const client = redis.createClient({
        port: port,
        host: host,
        db: db 
    });

  
    client.on("error", function(error) {
        console.error("Conection error: "+ error);
        res.status(500).send("Conection error: "+ error); 
        return;
    });
      
    client.flushdb(function(error, reply) {
          if(error){
            console.error("Flush dberror: "+ error);
            client.quit();
            res.status(500).send("Flush dberror: "+ error); 
            return;
          }else{
            console.log("FlushDB ",db,":",reply.toString());

            client.quit();

            var beginHR = process.hrtime();
            var begin = beginHR[0] * 1000000 + beginHR[1] / 1000;
            
            var baseOptions = [ "-s", host, "-p", port, "--select-db="+db];
            
            var fullOptions = [].concat(baseOptions).concat(options);

            console.log("Executing mtb with the following options:\n",JSON.stringify(fullOptions,null,2));

            var mtb;
            try{
                mtb = spawn('/memtier_benchmark', fullOptions);
            }catch(error){
                console.log("Spawn error (1):"+error);
                res.status(500).send(error); 
                return;
            }


            if (mtb){

                mtb.on('error', (error) => {
                    console.log("Spawn error (2):"+error);
                    res.status(500).send(error); 
                    return;
                });
    
                var result = {out:[],log:[],duration:0}; 

                var outLines = readline.createInterface({ input: mtb.stdout });
                var logLines = readline.createInterface({ input: mtb.stderr });
            
                outLines.on('line', (l) => {
                    result.out.push(l);
                    console.log(`out: ${l}`);
                });
                
                logLines.on('line', (l) => {
                    result.log.push(l);
                    console.log(`log: ${l}`);
                });

                mtb.on('close', (code) => {
                    var endHR = process.hrtime()
                    var end = endHR[0] * 1000000 + endHR[1] / 1000;
                    var duration = (end - begin) / 1000;
                    var roundedDuration = Math.round(duration * 1000) / 1000;
                    console.log(`child process exited with code ${code} (${roundedDuration} ms)`);
                    result.duration = roundedDuration;
                    res.send(result);
                });

            }else{
                console.log("Spawn error (3):"+error);
                res.status(500).send(error); 
                return;
            }
            
            
        }
    });
        
}

app.get('/redis/*', (req, res) => {
    
    var path = req.originalUrl.split("/");
 
    if(path[1] != "redis" || path[5] != "memtier_benchmark"){
        res.send(' \
            <html><body> \
            Use <pre>/redis/{host}/{port}/{db}/memtier_benchmark/opt1/opt2/....</pre> \
            <br>Example: <pre>/redis/127.0.0.1/6379/15/memtier_benchmark/-R/-n/1/-d/100</pre> \
            <br><a href="https://redislabs.com/blog/memtier_benchmark-a-high-throughput-benchmarking-tool-for-redis-memcached/">memtier_benchmark params reference</a> \
            </body></html>');
    }else{
        var host = path[2];
        var port = path[3];
        var db = path[4];
        var host = path[2];
        var options = path.slice(6);
        console.log('Processing request... Host: '+host+" Port:"+port+" DB:"+db+" options: "+JSON.stringify(options));
        
        processRequest(host,port,db, options, res);
    }

});

app.get('/', (req, res) => {
    res.send(' \
            <html><body> \
            Use <pre>/redis/{host}/{port}/{db}/memtier_benchmark/opt1/opt2/....</pre> \
            <br>Example: <pre>/redis/127.0.0.1/6379/15/memtier_benchmark/-R/-n/1/-d/100</pre> \
            <br><a href="https://redislabs.com/blog/memtier_benchmark-a-high-throughput-benchmarking-tool-for-redis-memcached/">memtier_benchmark params reference</a> \
            </body></html>');
})


app.listen(port, () => console.log('Server listening on port '+port));