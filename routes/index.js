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
    var party = database.getParty(id);

    if( ! party ) {
        res.send('Party does not exist');
    }

    res.render('party', {title: 'Such Jukebox!', party: party});
}