// Prevent image downloads on mobile and desktop
(function() {
  'use strict';
  
  // Detect if device is mobile
  function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  // Prevent right-click context menu on images
  document.addEventListener('contextmenu', function(e) {
    if (e.target.tagName.toLowerCase() === 'img') {
      e.preventDefault();
      alert('Image download is disabled.');
    }
  }, false);
  
  // Prevent long-press on mobile (context menu)
  if (isMobile()) {
    let longPressTimer;
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      img.addEventListener('touchstart', function(e) {
        longPressTimer = setTimeout(() => {
          e.preventDefault();
          alert('Image download is disabled.');
        }, 500);
      }, false);
      
      img.addEventListener('touchend', function() {
        clearTimeout(longPressTimer);
      }, false);
      
      // Prevent image save on long-press
      img.addEventListener('touchmove', function() {
        clearTimeout(longPressTimer);
      }, false);
    });
  }
  
  // Prevent drag-and-drop of images
  document.addEventListener('dragstart', function(e) {
    if (e.target.tagName.toLowerCase() === 'img') {
      e.preventDefault();
    }
  }, false);
  
  // Disable image context menu on double-tap
  document.addEventListener('dblclick', function(e) {
    if (e.target.tagName.toLowerCase() === 'img') {
      e.preventDefault();
    }
  }, false);
})();
