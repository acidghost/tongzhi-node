/**
 * Created by acidghost on 22/04/14.
 */

var graph = require('fbgraph'),

    config = global.config,
    log = global.log,
    events = global.events,
    url = global.url,
    http = global.http;

function FacebookService() {



}

FacebookService.prototype = {

  auth: function(req, res) {

    var parsedUrl = url.parse(req.url, true);

    if (!parsedUrl.query.code) {
      var authUrl = graph.getOauthUrl({
        'client_id': config.facebook.client_id,
        'redirect_uri': config.facebook.redirect_uri,
        'scope': config.facebook.scope
      });

      if (!parsedUrl.query.error) { //checks whether a user denied the app facebook login/permissions
        res.writeHead(302, { 'Location': authUrl });
        res.end();
      } else {  //req.query.error == 'access_denied'
        log.error('Facebook login error: ', parsedUrl.query.error);
        res.send('access denied');
      }
    } else {
      // code is set
      // we'll send that and get the access token
      graph.authorize({
        'client_id': config.facebook.client_id,
        'client_secret': config.facebook.client_secret,
        'redirect_uri': config.facebook.redirect_uri,
        'code': parsedUrl.query.code
      }, function (err, facebookRes) {
        if(err) {
          log.error(err);
          res.writeHead(400);
          res.write(err);
          res.end();
        }
        log.info('Facebook access token: ', facebookRes.access_token, '\n');
        graph.setAccessToken(facebookRes.access_token);
        events.emit('hasFbToken');
        res.writeHead(201);
        res.end();
      });
    }

  },

  getUnseenLikes: function () {

    graph.get('/me/notifications?fields=application,title,unread&include_read=false', { limit: 50 }, function (err, res) {
      if (err) {
        log.error(err);
      } else {
        var results = [];
        for (var i in res.data) {
          if(res.data[i].application.name == 'Likes') {
            log.debug('Logging res.data['+i+']: ', res.data[i]);
            results.push({
              id: res.data[i].id,
              title: res.data[i].title,
              app: res.data[i].application.name,
              unread: res.data[i].unread
            });
          }
        }
        events.emit('fbUnseenLikes', results);
      }
    });

  },

  getUnreadMessages: function() {

    graph.get('/me/inbox', { limit: 20 }, function (err, res) {
      if (err) {
        log.error(err);
      } else {
        var results = [];
        for (var i in res.data) {
          var currentData = res.data[i];
          if(currentData.unread) {
            log.debug('Logging inbox res.data['+i+']: ', currentData.id, currentData.to.data);

            var lastMessage = undefined;
            if(currentData.comments) {
              lastMessage = currentData.comments.data.slice(currentData.comments.data.length - 3, currentData.comments.data.length);
            }
            results.push({
              id: res.data[i].id,
              to: res.data[i].to.data,
              lastMessage: lastMessage,
              unseen: res.data[i].unseen,
              unread: res.data[i].unread
            });
          }
        }
        events.emit('fbUnreadMessages', results);
      }
    });

  },

  getFriendsNotifications: function() {

    graph.get('/me/notifications?fields=application,title&include_read=false', { limit: 50 }, function (err, res) {
      if (err) {
        log.error(err);
      } else {
        var results = [];
        for (var i in res.data) {
          if(res.data[i].application.name == 'Friends') {
            log.debug('Logging res.data['+i+']: ', res.data[i]);
            results.push({
              id: res.data[i].id,
              title: res.data[i].title,
              app: res.data[i].application.name
            });
          }
        }
        events.emit('fbFriendRequests', results);
      }
    });

  }

};

module.exports = FacebookService;
