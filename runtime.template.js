var appCacheIframe;

function hasSW() {
  return 'serviceWorker' in navigator &&
    // This is how I block Chrome 40 and detect Chrome 41, because first has
    // bugs with history.pustState and/or hashchange
    (window.fetch || 'imageRendering' in document.documentElement.style) &&
    (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname.indexOf('127.') === 0)
}

function install(options) {
  options || (options = {});

    if (hasSW()) {
      var registration = navigator.serviceWorker
        .register(
          <%- JSON.stringify(ServiceWorker.location) %>
        );


    var handleUpdating = function(registration) {
        var sw = registration.installing || registration.waiting;
        var ignoreInstalling;
        var ignoreWaiting;

        // No SW or already handled
        if (!sw || sw.onstatechange) return;

        var stateChangeHandler;

        // Already has SW
        if (registration.active) {
        onUpdateStateChange();
        stateChangeHandler = onUpdateStateChange;
        } else {
        onInstallStateChange();
        stateChangeHandler = onInstallStateChange;
        }

        ignoreInstalling = true;
        if (registration.waiting) {
        ignoreWaiting = true;
        }

        sw.onstatechange = stateChangeHandler;

        function onUpdateStateChange() {
        switch (sw.state) {
            case 'redundant': {
            sendEvent('onUpdateFailed');
            sw.onstatechange = null;
            } break;

            case 'installing': {
            if (!ignoreInstalling) {
                sendEvent('onUpdating');
            }
            } break;

            case 'installed': {
            if (!ignoreWaiting) {
                sendEvent('onUpdateReady');
            }
            } break;

            case 'activated': {
            sendEvent('onUpdated');
            sw.onstatechange = null;
            } break;
        }
        }

        function onInstallStateChange() {
        switch (sw.state) {
            case 'redundant': {
            // Failed to install, ignore
            sw.onstatechange = null;
            } break;

            case 'installing': {
            // Installing, ignore
            } break;

            case 'installed': {
            // Installed, wait activation
            } break;

            case 'activated': {
            sendEvent('onInstalled');
            sw.onstatechange = null;
            } break;
        }
        }
    };

    var sendEvent = function(event) {
        if (typeof options[event] === 'function') {
        options[event]({
            source: 'ServiceWorker'
        });
        }
    };

    registration.then(function(reg) {
        // WTF no reg?
        if (!reg) return;

        // Installed but Shift-Reloaded (page is not controller by SW),
        // update might be ready at this point (more than one tab opened).
        // Anyway, if page is hard-reloaded, then it probably already have latest version
        // but it's not controlled by SW yet. Applying update will claim this page
        // to be controlled by SW. Maybe set flag to not reload it?
        // if (!navigator.serviceWorker.controller) return;

        handleUpdating(reg);
        reg.onupdatefound = function() {
            handleUpdating(reg);
        };
    }).catch(function(err) {
        sendEvent('onError');
        return Promise.reject(err);
    });

      return;
    }
}

function applyUpdate(callback, errback) {
    if (hasSW()) {
      navigator.serviceWorker.getRegistration().then(function(registration) {
        if (!registration || !registration.waiting) {
          errback && errback();
          return;
        }

        registration.waiting.postMessage({
          action: 'skipWaiting'
        });

        callback && callback();
      });

      return;
    }
}

function update() {
    if (hasSW()) {
      navigator.serviceWorker.getRegistration().then(function(registration) {
        if (!registration) return;
        return registration.update();
      });
    }
  }
}

setInterval(update, <%- autoUpdate %>);

exports.install = install;
exports.applyUpdate = applyUpdate;
exports.update = update;
