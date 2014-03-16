
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
  res.render('party', {title: 'Such Jukebox!' });
}