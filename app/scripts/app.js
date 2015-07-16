/*
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

(function(document) {
  'use strict';

  // Grab a reference to our auto-binding template
  // and give it some initial binding values
  // Learn more about auto-binding templates at http://goo.gl/Dx1u2g
  var app = document.querySelector('#app');

  app.isAuthorized = false;
  app.title = 'Experts Tracking App'; 

  app.displayInstalledToast = function() {
    document.querySelector('#cachingComplete').show();
  };

  // Listen for template bound event to know when bindings
  // have resolved and content has been stamped to the page
  app.addEventListener('dom-change', function() {
    console.log('Our app is ready to rock!');
  });

  // See https://github.com/Polymer/polymer/issues/1381
  window.addEventListener('WebComponentsReady', function() {
    // imports are loaded and elements have been registered
  });

  // Close drawer after menu item is selected if drawerPanel is narrow
  app.onMenuSelect = function() {
    var drawerPanel = document.querySelector('#paperDrawerPanel');
    if (drawerPanel.narrow) {
      drawerPanel.closeDrawer();
    }
  };
  
  app._filterPGByCategory = function(item){
    //Filter if the user is logged in AND have a Category of Expertise, show only the PGs for that category
    if (app.user && app.user.category && !app.user.isGoogler){
      return (item.category === app.user.category);
    }
    return true;
  };
  
  app._sortPGs = function(a,b) {
    if(a.tag.toLowerCase() > b.tag.toLowerCase()) {
      return 1;
    }
    if(a.tag.toLowerCase() < b.tag.toLowerCase()) {
      return -1;
    }
    return 0;
  };
  
  app._userChanged = function(newValue){
    app.set('user', newValue.detail.value);
    //User changed, force the PG list to be redrawn
    app.$.pgList.render();
  };

})(document);
