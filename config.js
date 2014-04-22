/**
 * Created by acidghost on 22/04/14.
 */

module.exports = {

  logger: 'verbose',

  // Remember to change also the redirecting URLs!
  port: 3737,

  facebook: {
    client_id: 'YOUR_FB_CLIENT_ID',
    client_secret: 'YOUR_FB_CLIENT_SECRET',
    scope: 'manage_notifications, read_mailbox',
    redirect_uri: 'http://localhost:3737/auth/facebook'
  }

};
