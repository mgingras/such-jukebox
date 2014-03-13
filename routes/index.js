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
        res.send({error: 'Party does not exist'});
        return;
    }

    res.render('party', {
    	title: 'Such Jukebox!', 
    	party: party, 
    	isHost: hostPassword === party.hostPassword
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


exports.partyVoteSong = function(req,res){
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

    if(isVoteDown) {
    	party.voteForSong(songQueueId, true);
    } else {
		party.voteForSong(songQueueId);
    }

    res.send({});
}