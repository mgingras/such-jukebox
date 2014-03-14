var objects = require('../public/js/core-objects')
var database = require('../database');
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
  res.render('joining', {title: 'Such Jukebox!' });
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

    res.render('party', {
    	title: 'Such Jukebox!', 
    	party: party, 
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

exports.becomeGuest = function(req, res) {
    var id = req.params.id;
    var party = database.getParty(id);

    if( ! party ) {
        res.send({error: 'Party does not exist'});
        return;
    }

    if(req.session.host)
        req.session.host[id] = undefined;
    res.send({});
}


exports.partyVoteSong = function(req,res){
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

    if(isVoteDown === true || isVoteDown === 'true') {
    	party.voteForSong(songQueueId, true);
    } else {
		party.voteForSong(songQueueId);
    }

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