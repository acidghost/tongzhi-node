/**
 * Created by acidghost on 23/04/14.
 */

var _ = require('underscore'),
    log = require('captains-log')();

module.exports = function(config) {

  var configLocal = undefined;
  try {
    configLocal = require('./local.js');
  } catch(err) {
    log.warn('Unable to find local configuration (config/local.js)\n\n');
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

  return config;

};
