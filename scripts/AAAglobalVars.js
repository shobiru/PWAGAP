"use strict";
var DEBUG = true;  // ENABLE/DISABLE Console Logs
if(!DEBUG){  console.log = function() {} }

var n;   // num clienti
var m;   // num server
var c;   // matrice dei costi
var req; // matrice delle richieste
var cap; // vattore delle capacitÃ 
var sol; // vettore soluzione
var solbest; // vettore migliore soluzione trovata
var startTime, endTime, timeDiff; // tempi esecuzione
var zub = Number.MAX_VALUE;       // costo miglior soluzione trovata
var zlbBest = Number.MAX_VALUE;   // best lower bound

var jInstance;    // istanza in input
var EPS = 0.001;


function copyGlobalVars() {
    return {
        n: n,
        m: m,
        c: c,
        req: req,
        cap: cap,
        sol: sol,
        solbest: solbest,
        startTime: startTime,
        endTime: endTime,
        timeDiff: timeDiff,
        zub: zub,
        zlbBest: zlbBest,
        jInstance: jInstance,
        EPS: EPS
    }
}