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
var configLoader = require('./config/config.loader.js');
config = configLoader(config);
log = log({ level: config.logger, logLevels: { debug: 0 } });

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

  var CheckerService = require('./services/checker');
  var checker = new CheckerService(fbService);

});
