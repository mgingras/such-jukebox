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
    var s1 = new objects.SongInQueue({
        song: new objects.Song({
            title: 'Baby, You Wouldn\'t Last A Minute On The Creek',
            artist: 'Chiodos',
            imageUrl: 'http://s3.evcdn.com/images/block/I0-001/004/185/790-5.jpeg_/chiodos-90.jpeg',
            fileLocation: '/songs/chiodos.mp3'
        }),
        id: 1
    });
    var s2 = new objects.SongInQueue({
        song: new objects.Song({
            title: '3005',
            artist: 'Childish Gambino',
            imageUrl: 'http://covers.mp3million.com/1000651/50/cover.jpg',
            fileLocation: '/songs/3005.mp3'
        }),
        id: 2,
        ratioOfUpsToSkips: 40
    });
    var s3 = new objects.SongInQueue({
        song: new objects.Song({
            title: 'Dial Up',
            artist: 'Childish Gambino',
            imageUrl: 'http://covers.mp3million.com/1000651/50/cover.jpg',
            fileLocation: '/songs/3005.mp3'
        }),
        id: 3,
        ratioOfUpsToSkips: -1
    });
    var s4 = new objects.SongInQueue({
        song: new objects.Song({
            title: 'Death By Numbers',
            artist: 'Childish Gambino',
            imageUrl: 'http://covers.mp3million.com/1000651/50/cover.jpg',
            fileLocation: '/songs/3005.mp3'
        }),
        id: 4,
        ratioOfUpsToSkips: 2
    });
    var s5 = new objects.SongInQueue({
        song: new objects.Song({
            title: 'Pink Toes',
            artist: 'Childish Gambino',
            imageUrl: 'http://covers.mp3million.com/1000651/50/cover.jpg',
            fileLocation: '/songs/3005.mp3'
        }),
        id: 5,
        ratioOfUpsToSkips: 0
    });
    var s6 = new objects.SongInQueue({
        song: new objects.Song({
            title: 'Urn',
            artist: 'Childish Gambino',
            imageUrl: 'http://covers.mp3million.com/1000651/50/cover.jpg',
            fileLocation: '/songs/3005.mp3'
        }),
        id: 6,
        ratioOfUpsToSkips: 1
    });
    var s7 = new objects.SongInQueue({
        song: new objects.Song({
            title: 'No Exit',
            artist: 'Childish Gambino',
            imageUrl: 'http://covers.mp3million.com/1000651/50/cover.jpg',
            fileLocation: '/songs/3005.mp3'
        }),
        id: 7,
        ratioOfUpsToSkips: 1
    });
    var s8 = new objects.SongInQueue({
        song: new objects.Song({
            title: 'Sweatpants',
            artist: 'Childish Gambino',
            imageUrl: 'http://covers.mp3million.com/1000651/50/cover.jpg',
            fileLocation: '/songs/3005.mp3'
        }),
        id: 8,
        ratioOfUpsToSkips: 2
    });
    var songs = [s1, s2, s3, s4, s5, s6, s7, s8];
    res.render('party', {title: 'Such Jukebox!', songs: songs});
}