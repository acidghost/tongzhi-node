/**
 * Created by acidghost on 22/04/14.
 */

module.exports = {

  // Logger verbosity
  logger: 'info',

  // Checker refresh time in seconds
  checkerRefresh: 60 * 5,

  // Remember to change also the redirecting URLs!
  port: 3737,

  arduino: {
    serialPort: '/dev/ttyACM0'
  },

  // Facebook app configurations
  facebook: {
    client_id: 'YOUR_FB_CLIENT_ID',
    client_secret: 'YOUR_FB_CLIENT_SECRET',
    scope: 'manage_notifications, read_mailbox',
    redirect_uri: 'http://localhost:3737/auth/facebook'
  },

  // Speaker module configurations
  say: {
    enabled: true,                    // weather it's enabled or not
    voice: 'voice_kal_diphone',       // which voice to use (for Linux uses Festival)
    readMessages: true,               // reads out loud messages (turn off for privacy concerns)
    translate: true,                  // activates the built in translator
    language: 'Italian'               // into which language to translate
  }

};
