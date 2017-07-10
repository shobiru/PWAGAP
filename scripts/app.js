
(function() {
  'use strict';

  // Registration or service worker
  if('serviceWorker' in navigator){
    navigator.serviceWorker
      .register('./service-worker.js')
      .then(function(){
        console.log('Service Worker correctly registered.')
      });
  }

})();
