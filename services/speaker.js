/**
 * Created by acidghost on 23/04/14.
 */

var say = require('say'),

    config = global.config,
    log = global.log,
    events = global.events;

function SpeakerService() {

  if(config.say.translate) {
    this.translate = require('translate');
  }

}

SpeakerService.prototype = {

  sayPhrase: function(text) {

    log.debug('Saying phrase: ', text);

    if(config.say.translate) {
      this.translate.text({ input: 'English', output: config.say.language }, text, function(err, transText) {
        if(err) {
          log.error('Error translating: ', err);
        } else {
          log.info('Translated text: ', transText);
          say.speak(config.say.voice, transText, function() {
            log.debug('Speech completed.');
          });
        }
      });
    } else {
      say.speak(config.say.voice, text, function() {
        log.debug('Speech completed.');
      });
    }

  }

};

module.exports = SpeakerService;
