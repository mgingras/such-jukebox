var objects = require('../public/js/core-objects')
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
    var s1 = new objects.Song({
        title: 'Girlfriend',
        artist: 'J Beibs',
        imageUrl: 'https://pbs.twimg.com/profile_images/2867464382/831afcdb38903ecc80f2cef099136878.png'
    });
    var s2 = new objects.Song({
        title: '3005',
        artist: 'Childish Gambino',
        imageUrl: 'http://covers.mp3million.com/1000651/50/cover.jpg'
    });
    var songs = [s1, s2];
    res.render('party', {title: 'Such Jukebox!', songs: songs});
}