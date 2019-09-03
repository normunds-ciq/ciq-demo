(function() {
  loadStyle('http://127.0.0.1:5500/demo/demo.css');
  loadStyle('http://127.0.0.1:5500/demo/demo.js');

  function loadStyle(href, callback) {
    for (let i = 0; i < document.styleSheets.length; i++) {
      if (document.styleSheets[i].href == href) {
        return;
      }
    }
    const head = document.getElementsByTagName('head')[0];
    const isJs = /\.js$/.test(href);
    const link = document.createElement(isJs ? 'script' : 'link');

    if (!isJs) {
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = href;
    } else {
      link.src = href;
    }

    if (callback) {
      link.onload = function() {
        callback();
      };
    }
    head.appendChild(link);
  }
})();

(function() {
  loadStyle('https://normunds-ciq.github.io/ciq-demo/demo/demo.css');
  loadStyle('https://normunds-ciq.github.io/ciq-demo/demo/demo.js');

  function loadStyle(href, callback) {
    for (let i = 0; i < document.styleSheets.length; i++) {
      if (document.styleSheets[i].href == href) {
        return;
      }
    }
    const head = document.getElementsByTagName('head')[0];
    const isJs = /\.js$/.test(href);
    const link = document.createElement(isJs ? 'script' : 'link');

    if (!isJs) {
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = href;
    } else {
      link.src = href;
    }

    if (callback) {
      link.onload = function() {
        callback();
      };
    }
    head.appendChild(link);
  }
})();
