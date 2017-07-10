// DP recursion for the knapsack: obj max
function KDynRecur(cap, Q, val, solK)
{  var q,i;
   var Kopt=0;

   var n = Q.length;
   var f = new Array(cap+1);
   for (i=0;i<cap+1;i++)
      f[i] = new Array(n);

   for(i=0;i<n;i++)
      for(q=0;q<=cap;q++)
         f[q][i]=0;

   for(i=0;i<n;i++)
      for(q=0;q<=cap;q++)
         switch(i)
         {  case 0:
               if(q >= Q[i])
               {  f[q][i] = Math.max(0, val[i]);
                  //console.log("q:"+q+" i:"+i+" f:"+f[q][i]);
               }
               else
               {  f[q][i] = 0;
                  //console.log("q:"+q+" i:"+i+" f:"+f[q][i]);
               }
               break;
            default:
               if(q >= Q[i])
               {  f[q][i] = Math.max(f[q][i-1], f[q-Q[i]][i-1] + val[i]);
                  //console.log("q:"+q+" i:"+i+" f:"+f[q][i]);
               }
               else
               {  f[q][i] = f[q][i-1];
                  //console.log("q:"+q+" i:"+i+" f:"+f[q][i]+" f[q,i-1]" +f[q][i-1]);
               }
               break;
         }

   var imax=0;
   for(i=0;i<n;i++)
      if(f[cap][i] > Kopt)
      {  Kopt = f[cap][i];
         imax = i;
      }

   decodeSolKnap(imax,solK,Kopt,f,cap,val,Q);
   //alert("KP Optimum: "+Kopt);
   return Kopt;
}

function decodeSolKnap(i,solK,Kopt,f,cap,val,Q)
{  var q=cap;

   while(q>0 && i>0)
   {  if( Math.abs(f[q][i-1] - f[q][i]) < EPS)
      {  i--;
         continue;
      }

      if( Math.abs(f[q-Q[i]][i-1] - (f[q][i]-val[i]) ) < EPS)
      {  q -= Q[i];
         solK[i] = 1;
         i--;
         continue;
      }

      alert("[decodeSolKnap] quel al tragia");
      break;
   }

   if(i==0 && q>0)
      if(f[q][i] == val[i])
         solK[i] = 1;

   checkSolKnap(solK,cap,Kopt,Q,val);
}

function checkSolKnap(solK,cap,Kopt,Q,val)
{  var i,size=0;
   var profit = 0;

   for(i=0;i<n;i++)
      if(solK[i]>0)
      {  size += Q[i];
         profit += val[i];
      }

   if( Math.abs(profit - Kopt) > EPS)
      console.log("[checkSolKnap] Knapsack, Profit = "+profit+" Kopt = "+Kopt);

   if(size > cap)
      console.log("[checkSolKnap] Knapsack, Size = "+size+" cap = "+cap);
}