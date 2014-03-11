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

SongInQueue = function(params) {
	this.song;
	this.ratioOfUpsToSkips = 0;
	this.id;

	if(params) {
		this.song = params.song;
		if(params.ratioOfUpsToSkips) {
			this.ratioOfUpsToSkips = params.ratioOfUpsToSkips;
		}
		if(params.id){
			this.id = params.id;
		}
	}
}

if(typeof module !== 'undefined') {
	module.exports.Song = Song;
	module.exports.SongInQueue = SongInQueue;
}