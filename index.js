/**
 * Created by acidghost on 22/04/14.
 */

var _ = require('underscore'),
    log = require('captains-log'),
    url = require('url'),
    http = require('http');

// Load configurations
var config = require('./config');

(function loadConfigurations() {

  var configLocal = undefined;
  try {
    configLocal = require('./config.local');
  } catch(err) {
    log.warn(err);
  }

  if(configLocal) {
    _.each(config, function(val, key) {
      if(_.isObject(val)) {
        _.defaults(configLocal[key], config[key]);
        config[key] = configLocal[key];
      } else {
        if(configLocal[key] != undefined) {
          config[key] = configLocal[key];
        }
      }
    });
  }

  log = log({ level: config.logger });

})();

log.info('Welcome to the tongzhi social notifier!!');
log.info('----------------------------------------');
log.info('Everything seems set up properly...');

// Global libs & deps
global = {
  config: config,
  _: _,
  log: log,
  url: url,
  http: http
}

var FacebookService = require('./services/facebook');
var fbService = new FacebookService();
var server = http.createServer(function(req, res) {

  log.verbose('Logging request url: ', req.method + ' ' + req.url);
  var parsedUrl = url.parse(req.url, true);

  // Facebook authentication
  if(parsedUrl.pathname == '/auth/facebook' && req.method.toLowerCase() == 'get') {
    fbService.auth(req, res);
  }

});
server.listen(process.env.port || config.port || 3737);
