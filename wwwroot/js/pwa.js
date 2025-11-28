'use strict';

(function(){
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function(){
      navigator.serviceWorker.register('sw.js').catch(function(err){
        console.warn('ServiceWorker registration failed', err);
      });
    });
  }
})();
