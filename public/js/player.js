Player = function() {
	var that = this;
	var queuedSongs = [];
	var playedSongs = []; 
	var currentSong;
	var currentSongPercentDone = 0;
	var isPlaying;

	this.addSongToQueue = function(song) {
		if(!currentSong) {
			handleChangeToSong(song);
			return;
		}
		queuedSongs.push(song);
		updateUIState();
	}

	this.addSongsToQueue = function(_songs) {
		for(var i in _songs) {
			that.addSongToQueue(_songs[i]);
		}
	}	

	this.getQueuedSongs = function() {
		return queuedSongs;
	}

	this.getPlayedSongs = function() {
		return playedSongs;
	}

	this.nextSong = function() {
		if(queuedSongs.length === 0) {
			console.log('No more songs in queue');
			// Say no more songs

			return;
		}

		var song = queuedSongs.shift();
		console.log('Skipping song to  ' + JSON.stringify(song));

		handleChangeToSong(song);

	}

	function handleChangeToSong(newSong) {
		if(currentSong) {
			playedSongs.push(currentSong);
		}
		currentSong = newSong;
		currentSongPercentDone = 0;

		$('#player').empty();
		$('#player').append('<source src="'+currentSong.fileLocation+'" type="audio/mp3">');
		if(isPlaying) {
			$('#player').get(0).play();
		}

		console.log(queuedSongs);
		updateUIState();
		updateSongProgressUI();

		$('#current-song-title').text(currentSong.title);
		$('#current-song-artist').text(currentSong.artist);
		$('#current-song-icon').css({
			'background-image': 'url('+currentSong.imageUrl+')'
		});
	}

	function handlePlay() {
		// TODO
		isPlaying = true;
		$('#player').get(0).play();
	}

	function handlePause() {
		// TODO
		$('#player').get(0).pause();
		isPlaying = false;
	}


	$('#next-song-btn').click(function() {
		that.nextSong();
	});

	$('#pause-btn').click(function() {
		$(this).hide();
		$('#play-btn').show();
		handlePause();
	});

	$('#play-btn').click(function() {
		$(this).hide();
		$('#pause-btn').show();
		handlePlay();
	});

	function updateUIState() {
		if(queuedSongs.length === 0) {
			$('#next-song-btn').addClass('disabled');
		} else {
			$('#next-song-btn').removeClass('disabled');
		}
	}

	function updateSongProgressUI() {
		$('#current-song-progress > .progress-bar').css({width: currentSongPercentDone+'%'});
	}

	this.updateTimeOfCurrentSong = function(currentTime, duration){
		currentSongPercentDone = currentTime/duration*100;

		if(currentSongPercentDone >= 100) {
			that.nextSong();
		}

		updateSongProgressUI();
	}
}