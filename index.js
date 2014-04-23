/**
 * Created by acidghost on 22/04/14.
 */

var _ = require('underscore'),
    log = require('captains-log'),
    async = require('async'),
    open = require('open');
    url = require('url'),
    http = require('http'),
    events = new (require('events')).EventEmitter(),
    serialport = require('serialport'),
    readline = require('readline');

// Load configurations
var config = require('./config');
var configLoader = require('./config/config.loader.js');
config = configLoader(config);
log = log({ level: config.logger, logLevels: { debug: 0 } });

// Print welcome message
console.log('\n\tWelcome to the '.yellow + (' t o n g z h i '.blueBG + ' s o c i a l '.yellowBG).black.bold + ' notifier!\n'.blue);

async.series([
  function(cb) {
    // Config serial port library
    serialport.list(function (err, ports) {
      if(err) {
        cb(err);
      }
      if(ports.length) {
        if(config.arduino.serialPort) {
          for(var i in ports) {
            if(ports[i].comName == config.arduino.serialPort) {
              log.verbose('Found device on serial port ' + config.arduino.serialPort + '\n');
              cb(null, null);
              // don't know why this is needed...
              return;
            }
          }
          log.warn('The serial port declared in configuration file is not available...');
        }
      } else {
        cb('There is no device attached to the serial port...');
      }
      if(ports.length) {
        log.info('Select the port of your Arduino:');
        log.info('#  Port\t\tManufacturer, pnpId'.green);
        for(var i in ports) {
          var port = ports[i];
          log.info(((i+1) + ') ').yellow + port.comName.red + '\t' + port.manufacturer + ', ' + port.pnpId);
        }
        var rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl.question('Your selection: ', function(answer) {
          try {
            var answer = parseInt(answer);
            if(answer > 0 && answer <= ports.length) {
              config.arduino.serialPort = ports[answer-1].comName;
              log.verbose('Selected serial port: ', config.arduino.serialPort);
              cb(null, null);
            } else {
              throw new Error('Selection out of range...');
            }
          } catch(err) {
            cb(err);
          }
          rl.close();
        });

      }
    });
  },

  function(cb) {
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
      new CheckerService(fbService);

      var SerialService = require('./services/serial');
      new SerialService(new serialport.SerialPort(config.arduino.serialPort));

    });

    cb(null, null);
  }
], function(err) {
  // Final bootstrapping

  if(err) {
    log.error('-----------------------------------------------------'.yellow);
    log.error('# '.yellow + err);
    log.error('-----------------------------------------------------'.yellow);
    process.exit();
  }

  log.info('----------------------------------------'.green);
  log.info('#'.green + ' Everything seems set up properly...  '.cyan + '#'.green);
  log.info('----------------------------------------'.green + '\n');

  // Open browser for third party applications grant permissions
  log.warn('Please, note that the app needs to grant permissions over your Facebook account');
  log.warn('in order to read and manage your notifications.');
  log.warn('Now opening the following URL...\t' + config.facebook.redirect_uri.blue + '\n\n');
  open(config.facebook.redirect_uri);
});
