/*
All of the model objects used throughout the app and which are stored in the database
*/

Song = function(params) {
	if(!params)
		params = {};

	this.title = params.title;
	this.artist = params.artist;
	this.imageUrl = params.imageUrl;
	this.fileLocation = params.fileLocation;
	this.genre = params.genre;
	this.trackid = params.trackid;
}

SongInQueue = function(params) {
	var that = this;
	this.song;
	this.ratioOfUpsToSkips = 0;
	this.id;
	this.numVotesToSkip = 0;

	if(params) {
		this.song = params.song;
		if(params.ratioOfUpsToSkips) {
			this.ratioOfUpsToSkips = params.ratioOfUpsToSkips;
		}
		if(params.id){
			this.id = params.id;
		}
		if(params.numVotesToSkip) {
			this.numVotesToSkip = params.numVotesToSkip;
		}
	}

	this.voteUp = function() {
		that.ratioOfUpsToSkips++;
	}
	this.voteDown = function() {
		that.ratioOfUpsToSkips--;
	}

	this.voteToSkip = function() {
		that.numVotesToSkip++;
	}
}


Genre = function(id) {
	this.name = Genres[id];
	this.id = id;
}

Genres = {
	0: 'Alternative Rock',
	1: 'Ambient',
	2: 'Blues',
	3: 'Classical',
	4: 'Country',
	5: 'Dance',
	6: 'Deep House',
	7: 'Disco',
	8: 'Drum & Bass',
	9: 'Dubstep',
	10: 'Electro',
	11: 'Electronic',
	12: 'Folk',
	13: 'Hardcore Techno',
	14: 'Hip Hop',
	15: 'House',
	16: 'Indie Rock',
	17: 'Jazz',
	18: 'Latin',
	19: 'Metal',
	20: 'Minimal Techno',
	21: 'Mixtape',
	22: 'Piano',
	23: 'Pop',
	24: 'Progressive House',
	25: 'Punk',
	26: 'R&B',
	27: 'Rap',
	28: 'Reggae',
	29: 'Rock',
	30: 'Singer-Songwriter',
	31: 'Soul',
	32: 'Tech House',
	33: 'Techno',
	34: 'Trance',
	35: 'Trap',
	36: 'Trip Hop',
	37: 'World'
} 


Location = function(params) {
	this.lat = params.lat;
	this.lon = params.lon;
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
	this.currID = 0;

	this.getClientID = function(){
		return this.currID;
	}

	var currentQueuedSongId = 0;
	this.addSongToQueue = function(song) {
		if(!that.currentSong) {
			that.currentSong = song;
			return;
		}

		song.id=currentQueuedSongId;
		currentQueuedSongId++;
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
		var queuedSong = that.getQueuedSongById(songQueueId);

		if(!queuedSong){
			console.log('Queued song with id ['+songQueueId+'] not found');
			return;
		}
		if(!isVoteDown){
			console.log('Voting up for queuedSong with ID ['+songQueueId+'] in party with ID ['+that.id+']');
			queuedSong.voteUp();
		}
		else{
			console.log('Voting down for queuedSong with ID ['+songQueueId+'] in party with ID ['+that.id+']');
			queuedSong.voteDown();
		}

		that.queuedSongs.sort(function(a,b){
			var ratioA = a.ratioOfUpsToSkips !== undefined ? a.ratioOfUpsToSkips : 0;
			var ratioB = b.ratioOfUpsToSkips !== undefined ? b.ratioOfUpsToSkips : 0;

			return ratioB-ratioA;
		});
	}

	this.getQueuedSongById = function(songQueueId) {
		for(var i in that.queuedSongs) {
			if(''+that.queuedSongs[i].id === ''+songQueueId) {
				return that.queuedSongs[i];
			}
		}
	}

	function getQueuedSongIndexById(songQueueId) {
		for(var i in that.queuedSongs) {
			if(that.queuedSongs[i].id == songQueueId) {
				return i;
			}
		}
		return -1;
	}

	this.handleSongPlayed = function(songQueueId) {
		if(that.currentSong != undefined && ''+that.currentSong.id === ''+songQueueId) {
			that.playedSongs.push(that.currentSong);
			that.currentSong = undefined;
		} else {
			var index = getQueuedSongIndexById(songQueueId);
			if(index !== -1) {
				that.playedSongs.push(that.queuedSongs[index]);
				that.queuedSongs.splice(index, 1);
			}
		}
	}

	this.handleNewCurrentSong = function(songQueueId) {
		var index = getQueuedSongIndexById(songQueueId);

		if(index !== -1) {
			that.currentSong = that.queuedSongs[index];
			console.log('Changing current song to be ' + that.queuedSongs[index].song);
			that.queuedSongs.splice(index, 1);
		}
	}

	function isTrackAlreadyQueued(trackid) {
		for(var i in that.queuedSongs) {
			var qs = that.queuedSongs[i];
			if(qs.song.trackid == trackid) {
				return true;
			}
		}

		if(that.currentSong && trackid == that.currentSong.song.trackid)
			return true;
		return false;
	}
	this.isTrackAlreadyQueued = isTrackAlreadyQueued;

	function isTrackAlreadyPlayed(trackid) {
		for(var i in that.playedSongs) {
			var qs = that.playedSongs[i];
			if(qs.song.trackid == trackid) {
				return true;
			}
			return false;
		}
	}
	this.isTrackAlreadyPlayed = isTrackAlreadyPlayed;

	this.isTrackAlreadyPlayedOrQueued = function(trackid){
		var isQueued = that.isTrackAlreadyQueued(trackid);
		if(isQueued)
			return true;

		return that.isTrackAlreadyPlayed(trackid);
	}

}

if(typeof module !== 'undefined') {
	module.exports.Song = Song;
	module.exports.SongInQueue = SongInQueue;
	module.exports.Party = Party;
	module.exports.Genre = Genre;
	module.exports.Location = Location;
	module.exports.Genres = Genres;
}