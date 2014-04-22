/**
 * Created by acidghost on 22/04/14.
 */

var _ = require('underscore'),
    log = require('captains-log');

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

log.debug(config);
