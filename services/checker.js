/**
 * Created by acidghost on 23/04/14.
 */

var config = global.config,
    _ = global._,
    log = global.log,
    events = global.events;

function CheckerService(fbService) {

  (function checker () {
    fbService.getUnseenLikes();
    fbService.getUnreadMessages();
    setTimeout(checker, 1000 * config.checkerRefresh);
  })();

  if(config.say.enabled) {
    var SpeakerService = require('./speaker');
    spkService = new SpeakerService();
  }

  // This event is fired when unseen likes have been retrieved
  events.on('fbUnseenLikes', this.fbUnseenLikes);

  // This event is fired when unread messages have been detected
  events.on('fbUnreadMessages', this.fbUnreadMessages);

}

CheckerService.prototype = {

  fbUnseenLikes: function(data) {
    log.debug('Debugging fbUnseenLikes: ', data);

    if(data.length == 0)
      return;

    if(config.say.enabled) {
      _.each(data, function(value) {
        spkService.sayPhrase(value.title);
      });
    }
  },

  fbUnreadMessages: function(data) {
    log.debug('Debugging fbUnreadMessages: ', data);

    if(data.length == 0)
      return;

    var unreadMessages = 0;
    _.map(data, function(value) {
      unreadMessages += value.unread;
    });

    if(config.say.enabled) {
      spkService.sayPhrase('You have ' + unreadMessages + ' unread message' + ((unreadMessages>1) ? ('s.') : ('.')));
      _.each(data, function(thread, threadNum) {
        // This removes the last 'to' user, which usually is the recipient
        thread.to.pop();
        var senders = '';
        _.map(thread.to, function(sender) {
          senders += sender.name;
          if(thread.to.indexOf(sender) != thread.to.length-1) {
            senders += ', ';
          }
        });
        spkService.sayPhrase('Sender' + ((thread.to>1) ? ('s') : ('')) + ' of thread ' + (threadNum+1) + ': ' + senders);
        if(config.say.readMessages && thread.lastMessage) {
          var lastIndex = thread.lastMessage.length-1;
          spkService.sayPhrase(thread.lastMessage[lastIndex].from.name + ' writes: ' + thread.lastMessage[lastIndex].message);
        }
      });
    }
  }

};

module.exports = CheckerService;
