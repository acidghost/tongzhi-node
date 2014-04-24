/**
 * Created by acidghost on 23/04/14.
 */

var log = global.log;

function SerialService(serialPort) {

  var self = this;
  self.serialPort = serialPort;

  serialPort.on('open', function() {
    log.verbose('Serial port open');
    events.on('fbUnseenLikes', function(data) {
      self.drainAndSend(fbUnseenLikes, data);
    });
    events.on('fbUnreadMessages', function(data) {
      self.drainAndSend(fbUnreadMessages, data);
    });
  });

  var fbUnseenLikes = function(data) {
    var msg = 'FB-likes ' + data.length;
    log.debug('Serial write: ', msg.blue);
    return msg;
  };

  var fbUnreadMessages = function(data) {
    var unread = 0;
    for(var i in data) {
      unread += data[i].unread;
    }
    var msg = 'FB-msg ' + unread;
    log.debug('Serial write: ', msg.cyan);
    return msg;
  };

}

SerialService.prototype = {

  drainAndSend: function(fn, data) {

    var self = this;
    self.serialPort.drain(function(err) {
      if(err) {
        log.error(err);
      } else {
        var msg = fn(data);
        self.serialPort.write(msg+'\n', function(err) {
          if(err) {
            log.error(err);
          }
        });
      }
    });

  }

};

module.exports = SerialService;
