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
        title: 'Baby, You Wouldn\'t Last A Minute On The Creek',
        artist: 'Chiodos',
        imageUrl: 'http://s3.evcdn.com/images/block/I0-001/004/185/790-5.jpeg_/chiodos-90.jpeg',
        fileLocation: '/songs/chiodos.mp3'
    });
    var s2 = new objects.Song({
        title: '3005',
        artist: 'Childish Gambino',
        imageUrl: 'http://covers.mp3million.com/1000651/50/cover.jpg',
        fileLocation: '/songs/3005.mp3'
    });
    var songs = [s1, s2];
    res.render('party', {title: 'Such Jukebox!', songs: songs});
}