var objects = require('../public/js/core-objects');
var database = require('../database');
var Levenshtein = require('levenshtein');
var Distance = require('geo-distance-safe');
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Such Jukebox!' });
};

exports.hosting = function(req,res){
  res.render('hosting', {title: 'Such Jukebox!' });
}

exports.joining = function(req,res){
  var parties = database.getParties();
  var partyNames = [];
  for(var key in parties){
    partyNames.push({name: parties[key].name, id: parties[key].id});
  }
  res.render('joining', {title: 'Such Jukebox!', parties: partyNames });
}

exports.party = function(req,res){
    var id = req.params.id;
    var hostPassword = req.body.hostPassword;

    var party = database.getParty(id);

    if( ! party ) {
        console.log('User tried to access party that doesn\'t exist with ID ['+id+']')
        res.send({error: 'Party does not exist'});
        return;
    }

    var isHost = false;
    if(req.session.host !== undefined && req.session.host[id]) {
        console.log('Host is accessing party page for party with ID ['+id+']');
        isHost = true;
    }

    if( !isHost && hostPassword !== undefined && hostPassword === party.hostPassword ) {
        console.log('Host is accessing party page for party with ID ['+id+']');
        if(req.session.host === undefined) {
            req.session.host = {};
        }
        req.session.host[id] = true;
        isHost = true;
    }
    var votedFor = []
    if(req.session.partyVotes){
      if(req.session.partyVotes[id]){
        votedFor = req.session.partyVotes[id];
      }
    }
    res.render('party', {
    	title: 'Such Jukebox!',
    	party: party,
        votedFor: votedFor,
    	isHost: isHost
    });
}

exports.hostParty = function(req,res){
	var id = req.params.id;
    var party = database.getParty(id);

    if( ! party ) {
        res.send({error: 'Party does not exist'});
        return;
    }

    res.render('hostParty', {
    	title: 'Such Jukebox!',
    	partyId: id
    });
}
exports.createParty = function(req,res){
    var party = new Party(req.body);
    database.addParty(party);
    party.hostPassword = 'root'
    req.session.host = {};
    req.session.host[party.id] = true;
    res.send({partyId: party.id});
}

exports.becomeGuest = function(req, res) {
    console.log("Become Guest");
    var id = req.params.id;
    var party = database.getParty(id);

    if( ! party ) {
        res.send({error: 'Party does not exist'});
        return;
    }

    if(req.session.host)
        req.session.host[id] = undefined;
    if(req.session)
        console.log(req.session);
    req.session.party = id;
    req.session.id = party.getClientID();
    res.send();
}


exports.partyVoteSong = function(req,res){
    if(req.session.partyVotes == null){
        //Array to track parties visited
        req.session.partyVotes = [];
    }
    var id = req.params.id;
    var isVoteDown = req.body.isVoteDown;
    var songQueueId = req.body.songQueueId;
    var party = database.getParty(id);
    if( ! party ) {
        res.send({error: 'Party does not exist'});
        return;
    }

    if( ! songQueueId ) {
        res.send({error: 'You need to give a songQueueId'});
        return;
    }

    if(req.session.partyVotes[id] == null){
        //Array to track songs voted for
        req.session.partyVotes[id] = [];
    }

    if(req.session.partyVotes[id][songQueueId]){
        res.send({error: 'You already voted!'});
        return;
    }
    if(isVoteDown === true || isVoteDown === 'true') {
        party.voteForSong(songQueueId, true);
    }
    else {
        party.voteForSong(songQueueId);
    }
    req.session.partyVotes[id][songQueueId] = 'voted';
    res.send({});
}

exports.newPartyState = function(req,res){
    var id = req.params.id;
    var party = database.getParty(id);
    if( ! party ) {
        res.send({error: 'Party does not exist'});
        return;
    }

    res.send({party: party});
}


exports.changedSongState = function(req,res){
    var id = req.params.id;
    var party = database.getParty(id);
    if( ! party ) {
        res.send({error: 'Party does not exist'});
        return;
    }

    res.send({party: party});
}

exports.updateCurrentSong = function(req,res) {
    var id = req.params.id;
    var party = database.getParty(id);
    var oldSongId = req.body.oldSongId;
    var newSongId = req.body.newSongId;

    if( ! party ) {
        res.send({error: 'Party does not exist'});
        return;
    }

    if(!req.session.host || ! req.session.host[id]){
        console.log('Non host tried to change the song state')
        res.send({error: 'You must be the host to do that'});
        return;
    }

    if(oldSongId !== undefined) {
        party.handleSongPlayed(oldSongId);
    }

    if(newSongId !== undefined) {
        party.handleNewCurrentSong(newSongId);
    }

    res.send({party: party});
}

exports.voteToSkipCurrentSong = function(req, res) {
    var id = req.params.id;
    var party = database.getParty(id);
    var songQueueId = req.body.songQueueId;

    if( ! party ) {
        res.send({error: 'Party does not exist'});
        return;
    }

    if(!songQueueId){
        res.send({error: 'You need to provide a song queue id'});
        return;
    }

    if(party.currentSong !== undefined && ''+party.currentSong.id === songQueueId) {
        party.currentSong.voteToSkip();
    }

    res.send({party: party});
}

exports.findParty = function(req, res) {
  var parties = database.getParties();
  var partyNames = [];
  var l = null;
  for(var key in parties){
    l = new Levenshtein(req.query.partyName, parties[key].name);
    console.log(parties[key].name + ": " + l.distance);
    if(l <= 8){
        partyNames.push({name: parties[key].name, id: parties[key].id});
    }
  }
  res.send(partyNames);
}

exports.nearbyParties = function(req, res){
  var parties = database.getParties();
  var partyNames = []; // [];
  var d = null;
  for(var key in parties){
    d = Distance.between(req.query.location, parties[key].location).human_readable();
    console.log(parties[key].name + ": " + d.distance);
    if(d.distance <= 25){
        partyNames.push({name: parties[key].name, id: parties[key].id, distance: d.distance});
    }

    partyNames.sort(function(a,b) { return (a.distance - b.distance) });
  }

  res.send(partyNames);
}
