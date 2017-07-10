if( 'function' === typeof importScripts) {
    importScripts('loadGap.js', 'localSearch.js', 'knapsackDP.js');

    this.onmessage = function (input) {
        // web workers has no access to global vars
        var gv = input.data.gv;
        maxiter = input.data.maxiter;
        alpha = input.data.alpha;
        minalpha = input.data.minalpha;
        n = gv.n;
        m = gv.m;   // num server
        c = gv.c;   // matrice dei costi
        req = gv.req; // matrice delle richieste
        cap = gv.cap; // vattore delle capacitÃ 
        sol = gv.sol; // vettore soluzione
        solbest = gv.solbest; // vettore migliore soluzione trovata
        startTime = gv.startTime;
        endTime = gv.endTime;
        timeDiff = gv.timeDiff;  // tempi esecuzione
        zub = Number.MAX_VALUE;       // costo miglior soluzione trovata
        zlbBest = Number.MAX_VALUE;   // best lower bound
        jInstance = gv.jInstance;   // istanza in input
        EPS = 0.001;

        console.log("[WW] " + JSON.stringify(input.data));
        switch (input.data.func) {

           case "run_lagrAss":
                 console.log(":: run_lagrAss", maxiter, alpha, minalpha);
                 run_lagrAss();
                 // Writes message (final) into outText
                 postMessage({task: "run_lagrAss", complete: true});
                 break;

           case "run_lagrCap":
                 console.log(":: run_lagrCap", maxiter, alpha, minalpha);
                 run_lagrCap();
                 // Writes message (final) into outText
                 postMessage({task: "run_lagrCap", complete: true});
                 break;
           default:
                 console.log("default:  ==>  NO task executed!");

        }


    };
}

function run_lagrCap()
{

   if(maxiter < 0) maxiter = Number.MAX_VALUE;
   // Writes message into outText
   postMessage({task: "lagrCap", complete: false, message: "Starting relax capacities, n="+n+"\n"});
   startTime = new Date();
   var z     = lagrNoCap(maxiter,alpha,minalpha);
   endTime   = new Date();
   timeDiff  = endTime - startTime; // time difference in ms
   console.log("LagrCap, optimization OK");
   console.log("LagrCap, zlb= "+zlbBest+" zub= "+zub+" t.cpu "+timeDiff+" ms");
   // Writes message into outText
   postMessage({task: "lagrCap", complete: false, message: "LagrCap, zlb= "+zlbBest+" zub= "+zub+" t.cpu "+timeDiff+" ms"});
   zlbBest = zub = Number.MAX_VALUE;
   solbest = sol = null;
}

function run_lagrAss()
{
   if(maxiter < 0) maxiter = Number.MAX_VALUE;
   // Writes message into outText
   postMessage({task: "lagrAss", complete: false, message: "Starting relaxed assignments, n="+n+"\n"});
   startTime = new Date();
   var z     = lagrNoAss(maxiter,alpha,minalpha);
   endTime   = new Date();
   timeDiff  = endTime - startTime; // time difference in ms
   console.log("LagrAss, optimization OK");
   console.log("LagrAss, zlb= "+zlbBest+" zub= "+zub+" t.cpu "+timeDiff+" ms");
   // Writes message into outText
   postMessage({task: "lagrAss", complete: false, message: "LagrAss, zlb= "+zlbBest+" zub= "+zub+" t.cpu "+timeDiff+" ms"});
   zlbBest = zub = Number.MAX_VALUE;
   solbest = sol = null;
}

function writeIterData(iter,zcurr,alpha,lbsol,subgrad,lambda,step)
{  console.log("iter "+iter+") zlbbest="+zlbBest+" zlb = "+zlb+" zub = "+zub+" alpha = "+alpha);
}

// Lagrangian, capacities relaxed
function lagrNoCap(maxiter,alpha,minalpha)
{  var iter=0,z,zcurr;

   if (zub === undefined)
      zub = Number.MAX_VALUE;

   var i,j,sumSubGrad2,iter=0,innerIter;
   var cost,step=0,alphastep;
   var lambda  = new Array(m);
   var subgrad = new Array(m);
   var lbsol = new Array(n);
   sol       = new Array(n);
   solbest   = new Array(n);

   alphastep = 0.97;
   innerIter = 40;
   zlbBest   = Number.MIN_VALUE;
   for(i=0;i<m;i++)
      lambda[i] = 0.0;

   iter = zcurr = 0;
   while(alpha>minalpha && iter < maxiter)
   {  lbsol = subproblem_withass(lambda,subgrad);
      cost = checkSol(lbsol);

      // -------------------------- Trovato l'ottimo
      if(cost == zlb || (zub-zlbBest) < 1.0 )
      {  console.log("[lagrNoCap] Got the optimum!!! zopt="+zub);
         // Writes message into outText
         postMessage({task: "lagrCap", complete: false, message: "[lagrNoCap] Got the optimum!!! zopt="+zub+" iter="+iter+"\n"});
         break;
      }
      else
      {  zcurr = fixSol(lbsol);
         //console.log("[lagrCap] iter="+iter+" zlb="+zlb+" zcurr="+zcurr+" zub="+zub);
         if(zcurr < 10*zlb)
         {  sol = lbsol.slice();
            opt10(c);
         }
      }

      // -------------------------- calcolo passo
      sumSubGrad2 = 0;
      for(i=0;i<m;i++)
         sumSubGrad2 += subgrad[i]*subgrad[i];
      fakeZub = Math.min(zcurr,1.2*zlb);
      fakeZub = Math.max(fakeZub,zlb+1);
      step = alpha*(fakeZub-zlb)/sumSubGrad2;

      if(iter%100 == 0)
         writeIterData(iter,zcurr,alpha,lbsol,subgrad,lambda,step);

      // -------------------------- penalty update
      for(i=0;i<m;i++)
         lambda[i] = Math.min(0,lambda[i]+step*subgrad[i]);
      iter++;
      if(iter % innerIter == 0)
         alpha = alphastep*alpha;
   }

   return zub;
}

// solves the assignment, capacities are relaxed
function subproblem_withass(lambda, subgrad)
{  var i,j,mini;
   var mincost;

   for(j=0;j<n;j++)
      sol[j] = -1;

   zlb = 0;
   for(i=0;i<m;i++)
   {  subgrad[i] = cap[i];
      zlb += cap[i]*lambda[i];      // relaxed capacities
   }

   for(j=0;j<n;j++)                 // min cost assignments
   {  mincost = Number.MAX_VALUE;
      mini    = Number.MAX_VALUE;
      for(i=0;i<m;i++)
         if( (c[i][j]-(req[i][j]*lambda[i])) < mincost)
         {  mincost = c[i][j]-(req[i][j]*lambda[i]);
            mini    = i;
         }
      sol[j] = mini;
      subgrad[mini] -= req[mini][j];
      zlb += mincost;
   }
   if(zlb>zlbBest) zlbBest = zlb;
   return sol;
}

// Lagrangian, assignments relaxed
function lagrNoAss(maxiter,alpha,minalpha)
{  var i,j,sumSubGrad2,iter=0,innerIter,zcurr;
   var cost,step=0,alphastep;
   var lambda  = new Array(n);   // one per assignment
   var subgrad = new Array(n);
   var lbsol   = new Array(m);   // one per capacity
   sol         = new Array(n);
   solbest     = new Array(n);

   if (zub === undefined)
      zub = Number.MAX_VALUE;

   alphastep = 0.9;
   innerIter = 40;
   zlbBest   = Number.MIN_VALUE;
   for(i=0;i<n;i++)
      lambda[i] = 0.0;

   iter = zcurr = 0;
   while(alpha>minalpha && iter < maxiter)
   {  lbsol = subproblem_withcap(lambda,subgrad);
      cost = checkSol(lbsol);

      // -------------------------- Trovato l'ottimo
      if(cost == zlb || (zub-zlbBest) < 1.0 )
      {  console.log("[lagrNoAss] Got the optimum!!! zopt="+zub);
         // Writes message into outText
         postMessage({task: "lagrAss", complete: false, message: "[lagrNoAss] Got the optimum!!! zopt="+zub+" iter="+iter+"\n"});
         break;
      }
      else
      {  zcurr = fixSol(lbsol);
         if(iter%10 == -1)
            console.log("[lagrNoAss] iter="+iter+" zlb="+zlb+" zcurr="+zcurr+" zub="+zub);
         if(zcurr < 10*zlb)
         {  sol = lbsol.slice();
            opt10(c);
         }
      }

      // -------------------------- calcolo passo
      sumSubGrad2 = 0;
      for(j=0;j<n;j++)
         sumSubGrad2 += subgrad[j]*subgrad[j];
      fakeZub = Math.min(zcurr,1.2*zlb);
      fakeZub = Math.max(fakeZub,zlb+1);
      step = alpha*(fakeZub-zlb)/sumSubGrad2;

      if(iter%100 == 0)
         writeIterData(iter,zcurr,alpha,lbsol,subgrad,lambda,step);

      // -------------------------- penalty update
      for(j=0;j<n;j++)
         lambda[j] += step*subgrad[j];
      iter++;
      if(iter % innerIter == 0)
         alpha = alphastep*alpha;
   }
   return zub;
}

// solves capacities (knapsacks), assignments are relaxed
function subproblem_withcap(lambda, subgrad)
{  var i,j;
   zlb = 0;

   for(j=0;j<n;j++)
   {  sol[j] = -1;
      subgrad[j] = 1;
   }

   var Q    = new Array(n);
   var val  = new Array(n);
   var solK = new Array(n);

   for(i=0;i<m;i++)
   {  for(j=0;j<n;j++)
      {  Q[j] = req[i][j];
         val[j] = -c[i][j]+lambda[j];   // segno inverso per farlo di min
         //val[j] = c[i][j];   // per debug
         solK[j] = 0;
      }
      zlb -= KDynRecur(cap[i], Q, val, solK); // segno inverso perchÃ¨ era di di min
      for(j=0;j<n;j++)
         if(solK[j] > 0)
         {  sol[j]=i;         // vero solo se soluzone ammissibile per assegnamento
            subgrad[j] -= 1;
         }
   }
   for(j=0;j<n;j++)
      zlb += lambda[j];       // somma penalitÃ  in funzione lagrangiana

   if (zlb > zlbBest) zlbBest = zlb;
   return sol;
}