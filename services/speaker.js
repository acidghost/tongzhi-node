/**
 * Created by acidghost on 23/04/14.
 */

var say = require('say'),

    config = global.config,
    log = global.log,
    events = global.events;

function SpeakerService() {

  global.phrases = [];

  if(config.say.translate) {
    this.translate = require('translate');
  }

  events.on('sayNextThing', function() {
    if(global.phrases.length == 0)
      return;

    var phrase = global.phrases[0];
    log.info('Saying phrase: ', phrase.yellow);
    say.speak(config.say.voice, phrase, function() {
      // Removing the phrase just said
      global.phrases.splice(global.phrases.indexOf(phrase), 1);
      log.debug('Remaining phrases to say: ', global.phrases);
      events.emit('sayNextThing');
    });
  });

}

SpeakerService.prototype = {

  sayPhrase: function(text) {

    if(config.say.translate) {
      this.translate.text({ input: 'English', output: config.say.language }, text, function(err, transText) {
        if(err) {
          log.error('Error translating: ', err);
        } else {
          log.info('Translated text: ', transText);
          global.phrases.push(transText);
          if(global.phrases.length == 1) {
            events.emit('sayNextThing');
          }
        }
      });
    } else {
      global.phrases.push(text);
      if(global.phrases.length == 1) {
        events.emit('sayNextThing');
      }
    }

  }

};

module.exports = SpeakerService;
