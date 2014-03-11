Song = function(params) {
	this.title;
	this.artist;
	this.imageUrl;
	this.fileLocation;

	if(params) {
		this.title = params.title;
		this.artist = params.artist;
		this.imageUrl = params.imageUrl;
		this.fileLocation = params.fileLocation;
	}
}

if(typeof module !== 'undefined') {
	module.exports.Song = Song;
}