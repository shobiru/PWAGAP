// window['readWithCORS']=readWithCORS;      // for minification
// window['loadLocalFile']=loadLocalFile;    // for minification

function readWithCORS()
{  var resp;
   var req = new XMLHttpRequest();
   inText = document.getElementById("inputRemote").value;
   if ('withCredentials' in req) 
   {  
      // req.open('GET', 'http://astarte.csr.unibo.it/gapdata/'+inText, true);
      req.open('GET', 'https://shobiru.github.io/gap-solver/data/'+inText, true);
      req.onreadystatechange = function() 
      {
        if (req.readyState === 4) 
            if (req.status >= 200 && req.status < 400) 
            {  jInstance=JSON.parse(req.responseText);
               setInstance(jInstance);
            }
            else 
            {
               alert('reading error');
            }
      };
      req.send();
   }
}

// legge file dati locale
function loadLocalFile() 
{
   var input, file, fr;

   if (typeof window.FileReader !== 'function') {
      alert("The file API isn't supported on this browser yet.");
      return;
   }

   input = document.getElementById("inputLocal");
   if (!input) {
      alert("Couldn't find the fileinput element.");
   }
   else if (!input.files) {
      alert("This browser doesn't seem to support the `files` property of file inputs.");
   }
   else if (!input.files[0]) {
      alert("Please select a file before clicking 'Load'");
   }
   else {
      file = input.files[0];
      fr = new FileReader();
      fr.onload = receivedText;
      fr.readAsText(file);
   }
}

// elaborazione dei dati letti in locale
function receivedText(e) 
{
   istanza = e.target.result;
   jInstance = JSON.parse(istanza);
   setInstance(jInstance);
}

function setInstance(jInstance)
{
   n = jInstance.numcustomers;   // num clienti
   m = jInstance.numfacilities;  // num server
   c = jInstance.cost;   // matrice dei costi
   req = jInstance.req;  // matrice delle richieste
   cap = jInstance.cap;  // vattore delle capacitÃ 
   alert("Got instance "+jInstance.name+" n="+n);
}

function checkSol(sol)
{  var z = 0,j;
   var capused = new Array(m);
   for(i=0;i<m;i++) capused[i] = 0;
   // controllo assegnamenti
   for (j = 0; j < n; j++)
      if (sol[j] < 0 || sol[j] >= m || sol[j]===undefined)
      {  z = Number.MAX_VALUE;
         return z;
      }
      else
         z += c[sol[j]][j];
   // controllo capacitÃ 
   for (j = 0; j < n; j++)
   {  capused[sol[j]] += req[sol[j]][j];
      if (capused[sol[j]] > cap[sol[j]])
      {  z = Number.MAX_VALUE;
         return z;
      }
   }
   return z;
}

// recovers feasibility in case of partial or overassigned solution
function fixSol(infeasSol)
{  var i,j,zsol,imin=-1;
   var minreq;
   var capres = new Array(m);
   var sol = new Array(n);

   for(i=0;i<m;i++) capres[i]=cap[i];

   for(i=0;i<n;i++) sol[i]=infeasSol[i];

   // ricalcolo capacitÃ  residue. Se sovrassegnato, metto a sol a -1
   for(j=0;j<n;j++)
      if(sol[j]>=0 && (capres[sol[j]] >= req[sol[j]][j]))
         capres[sol[j]] -= req[sol[j]][j];
      else
         sol[j] = -1;

   zsol = 0;
   for(j=0;j<n;j++)
   {  if(sol[j]>=0)              // correct, do nothing
      {  zsol += c[sol[j]][j];
         continue;
      }

      // reassign i -1
      minreq = Number.MAX_VALUE;
      imin = -1;
      for(i=0;i<m;i++)
         if(capres[i]>=req[i][j] && req[i][j] < minreq)
         {  minreq = req[i][j];
            imin    = i;
         }

      if(imin<0)
      {  zsol = Number.MAX_VALUE;
         return zsol;           // could not recover feasibility
      }
      sol[j]=imin;
      capres[imin] -= req[imin][j];
      zsol += c[imin][j];
   }

   if(zsol<zub)
   {  for(i=0;i<n;i++) solbest[i]=sol[i];
      zub = zsol;
      console.log("[fixSol] -------- zub improved! " + zub);
   }
   for(i=0;i<n;i++) infeasSol[i]=sol[i];

   return zsol;
}