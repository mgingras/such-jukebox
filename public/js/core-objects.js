Song = function(params) {
	if(!params)
		params = {};

	this.title = params.title;
	this.artist = params.artist;
	this.imageUrl = params.imageUrl;
	this.fileLocation = params.fileLocation;
	this.genre = params.genre;
}

SongInQueue = function(params) {
	var that = this;
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

	this.voteUp = function() {
		that.ratioOfUpsToSkips++;
	}
	this.voteDown = function() {
		that.ratioOfUpsToSkips--;
	}
}


Genre = function(params) {
	this.name = params.name;
	this.id = params.id;
}

Location = function(params) {
	this.latitude = params.latitude;
	this.longitude = params.longitude;
}

Party = function(params) {
	if(!params)
		params = {};

	var that = this;
	this.name = params.name;
	this.id = params.id;
	this.genreId = params.genreId;
	this.location = params.location;
	this.queuedSongs = [];
	this.currentSong = params.currentSong;
	this.playedSongs = [];
	this.hostPassword = params.hostPassword;


	this.addSongToQueue = function(song) {
		if(!that.currentSong) {
			that.currentSong = song;
			return;
		}

		if(that.queuedSongs.length == 0){
			that.queuedSongs.push(song);
		} else{
			for(var i = 0; i<that.queuedSongs.length; i++) {
				var qSong = that.queuedSongs[i];
				if(song.ratioOfUpsToSkips > qSong.ratioOfUpsToSkips){
					that.queuedSongs.splice(i, 0, song);
					break;
				}

				if(i === (that.queuedSongs.length-1)) {
					console.log('Pushing:' + song);
					that.queuedSongs.push(song);
					break;
				}
			}
		}
	}

	this.addSongsToQueue = function(songs) {
		for(var i in songs) {
			that.addSongToQueue(songs[i]);
		}
	}

	this.recalculateOrderOfSongs = function() {
		var queuedSongs = that.queuedSongs;
		that.queuedSongs = [];
		that.addSongsToQueue(queuedSongs);
	}	

	this.voteForSong= function(songQueueId, isVoteDown){
		for(var i in that.queuedSongs) {
			if(that.queuedSongs[i].id === songQueueId) {
				if(!isVoteDown)
					that.queuedSongs[i].voteUp();
				else
					that.queuedSongs[i].voteDown();
			}
		}
	}

}

if(typeof module !== 'undefined') {
	module.exports.Song = Song;
	module.exports.SongInQueue = SongInQueue;
	module.exports.Party = Party;
	module.exports.Genre = Genre;
	module.exports.Location = Location;
}