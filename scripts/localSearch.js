function run_opt10()
{
   opt10(c);
   var zcheck = checkSol(sol);
   console.log("[opt10] Costo "+z+" zcheck "+zcheck+" sol "+sol);
}

// neighborhood 1-0
function opt10(cost)
{  var i,isol,j,z = 0;
   var isImproved;
   //console.log("Euristica locale 1-0");

   var capLeft = cap.slice();   
   for(j=0;j<n;j++)
   {  capLeft[sol[j]] -= req[sol[j]][j];
      z += cost[sol[j]][j];
   }
   
   do
   {  isImproved = false;
      for(j=0;j<n;j++)
      {  isol = sol[j];
         for(i=0;i<m;i++)
         {  if(i==isol) continue;
            
            if(cost[isol][j]>cost[i][j] && capLeft[i] >= req[i][j])
            {
               sol[j]=i;
               capLeft[i] -= req[i][j];
               capLeft[isol] += req[isol][j];
               z -= cost[isol][j]-cost[i][j];
               //console.log("opt10, improvement. z="+z+" j:"+j+" da "+isol+" a "+i);
               isImproved=true;
               break;
            }
         }
         if(isImproved) break;
      }
   }
   while(isImproved);
   
   if(z < zub)
   { zcheck = checkSol(sol);
     zub = z;
     for(i=0;i<n;i++) solbest[i]=sol[i];
     console.log("[opt01] zub "+zub+" zcheck "+zcheck);
   }
   return z;
}

// neighborhood 1-1
function opt11(cost) 
{
   var j,j1,j2,temp,cap1,cap2,delta,z = 0;
   var zcheck,isImproved;

   var capLeft = cap.slice();

   // controllo ammissibilitÃ  soluzione di partenza
   for (j = 0; j < n; j++) 
   {  capLeft[sol[j]] -= req[sol[j]][j];
      z += cost[sol[j]][j];
   }
   zcheck = checkSol(sol);

   // scambio 2 clienti
   do 
   {
      isImproved = false;
      for (j1 = 0; j1 < n; j1++) 
      {
         for (j2 = j1 + 1; j2 < n; j2++) 
         {
            delta = (cost[sol[j1]][j1] + cost[sol[j2]][j2]) - 
                    (cost[sol[j1]][j2] + cost[sol[j2]][j1]);
            // soluz<ione originaria costa di piÃ¹
            if (delta > 0) 
            {
               cap1 = capLeft[sol[j1]] + req[sol[j1]][j1] - req[sol[j2]][j2];
               cap2 = capLeft[sol[j2]] + req[sol[j2]][j2] - req[sol[j1]][j1];
               if (cap1 >= 0 && cap2 >= 0) 
               {
                  // modifico le capacitÃ  residue aggiungendo la richiesta del cliente che tolgo e togliendo quella del cliente aggiunto
                  capLeft[sol[j1]] += req[sol[j1]][j1];
                  capLeft[sol[j1]] -= req[sol[j2]][j2];

                  capLeft[sol[j2]] += req[sol[j2]][j2];
                  capLeft[sol[j2]] -= req[sol[j1]][j1];
                  // scambio i due magazzini
                  temp    = sol[j1];
                  sol[j1] = sol[j2];
                  sol[j2] = temp;

                  z -= delta;
                  if (z < zub) 
                  {
                     zcheck = checkSol(sol);
                     if(Math.abs(z - zcheck) <= EPS)
                     {  zub = z;
                     }
                  }
                  isImproved = true;
              }
            }
            if (isImproved) break;
         }
         if (isImproved) break;
     }
   }
   while (isImproved);

   zcheck = 0;
   for (j = 0; j < n; j++)
     zcheck += cost[sol[j]][j];
   if (Math.abs(zcheck - z) > EPS)
   {  console.log("[1.1opt] Ahi ahi");
   }
   zcheck = checkSol(sol);
   return z;
}