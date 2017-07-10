/**
 * Created by ac on 2-6-17.
 */


var workers = [];
var scheduler = [];
var n_cores = navigator.hardwareConcurrency;

/**
* task:{
    path: filename.js,
    func: functionName
  }
*/

function addWorker(task){
    var idx = workers.length;
    var path = "scripts/";

    console.log("[add] idx: " + idx + " task: "+ task.path);

    workers.push(
        new Worker(path + task.path)
    );


    // start message; sends all the parameter to the Web Worker
    workers[idx].postMessage({
        func: task.func,
        maxiter: document.getElementById("inputIter").value,
        alpha: document.getElementById("inputAlpha").value,
        minalpha: document.getElementById("inputMinAlpha").value,
        gv: copyGlobalVars()
    });

    console.log("[wlen] " + workers.length);

    // on message from the web worker
    workers[idx].onmessage = function(event) {
        console.log("from: " + event.data.task + " complete: " + event.data.complete);

        // if message is not the final one
        if(event.data.complete === false){
            console.log("## outputText: " + event.data.message);
            document.getElementById("outputText").value += '['+event.data.task+']' + event.data.message;
            return;
        }

        workers[idx] = undefined;
        console.log(event.data);

        // when task has been complete start a new worker if there is any task left
        if(event.data.result !== undefined) {
            if (scheduler.length > 0) {
                var task = scheduler.pop();
                addWorker(task);
            }
        }

        //check if all web workers have completed their tasks
        var all_task_completed = true;
        workers.forEach(function(index, value) {
            if(value !== undefined){
                return all_task_completed = false;
            }
        });
        // console.log(workers);
        if(all_task_completed){
            console.log("------- all_task_completed -------");
        }
    };
}

// add script to web worker's scheduler
function startWorker(param) {

    console.log(param);
    scheduler.push(param);

    if(typeof(Worker) !== "undefined") {
        if(workers.length < n_cores){
            var task = scheduler.pop();
            // a new web worker is created here
            addWorker(task);
        }
    } else {
        document.getElementById("result").innerHTML = "Sorry! No Web Worker support.";
    }
}
