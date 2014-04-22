/**
 * Created by acidghost on 22/04/14.
 */

var _ = require('underscore'),
    log = require('captains-log'),
    open = require('open');
    url = require('url'),
    http = require('http'),
    events = new (require('events')).EventEmitter();

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

log.info('Welcome to the tongzhi social notifier!'.red);
log.info('----------------------------------------'.green);
log.info('#'.green + ' Everything seems set up properly...  '.cyan + '#'.green);
log.info('----------------------------------------'.green + '\n');
log.warn('Please, note that the app needs to grant permissions over your Facebook account');
log.warn('in order to read and manage your notifications.');
log.warn('Now opening the following URL...\t' + config.facebook.redirect_uri.blue + '\n\n');
open(config.facebook.redirect_uri);

// Global libs & deps
global = {
  config: config,
  _: _,
  log: log,
  events: events,
  url: url,
  http: http
};

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

events.on('hasFbToken', function() {
  log.silly('has token');

  var checkFacebook = function() {
    fbService.getUnseenLikes();
    fbService.getUnreadMessages();
  };
  checkFacebook();
  setInterval(checkFacebook, 1000 * 60);

  // This event is fired when unseen likes have been retrieved
  events.on('fbUnseenLikes', function(data) {
    log.debug('Debugging fbUnseenLikes: ', data);
  });

  // This event is fired when unread messages have been detected
  events.on('fbUnreadMessages', function(data) {
    log.debug('Debugging fbUnreadMessages: ', data);
  })
});
