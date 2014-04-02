
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var fs = require('fs');
var newrelic = require('newrelic');
var app = express();
var database = require('./database');
var testPopulator = require('./test-db-populator');
testPopulator.populate();


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({secret: 'OMGTHISISSOOOOSECRET'}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
  app.locals.pretty = true;
}

//Routes
app.get('/', routes.index);
app.get('/hosting', routes.hosting);
app.get('/joining', routes.joining);
app.get('/party/search', routes.findParty);
app.get('/party/nearby', routes.nearbyParties);
app.get('/party/:id', routes.party);
app.post('/party/:id', routes.party);
app.get('/party/:id/host', routes.hostParty);
app.post('/party/:id/becomeGuest', routes.becomeGuest);
app.post('/hostParty', routes.createParty);
app.post('/party/:id/voteSong', routes.partyVoteSong);
app.post('/party/:id/newState', routes.newPartyState);
app.post('/party/:id/updateCurrentSong', routes.updateCurrentSong);
app.post('/party/:id/voteToSkipCurrentSong', routes.voteToSkipCurrentSong);
app.post('/party/:id/queueSong', routes.queueSong);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});