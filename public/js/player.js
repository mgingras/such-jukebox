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
		$('#player').append('<source src="'+currentSong.song.fileLocation+'" type="audio/mp3">');
		if(isPlaying) {
			$('#player').get(0).play();
		}

		console.log(queuedSongs);
		updateUIState();
		updateSongProgressUI();

		$('#current-song-title').text(currentSong.song.title);
		$('#current-song-artist').text(currentSong.song.artist);
		$('#current-song-icon').css({
			'background-image': 'url('+currentSong.song.imageUrl+')'
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
		updatePendingQueue();
	}

	function updatePendingQueue() {
		$('#queued-songs').empty();

		if(queuedSongs.length > 0) {
			for(var i in queuedSongs) {
				var song = queuedSongs[i];
				$('#queued-songs').append(getQueuedHtmlForSong(song));
			}
		} else {
			$('#queued-songs').append(
				'<li class="list-group-item">'+
					'<p>There are no more songs</p>'+
				'</li>');
		}
	}

	function getQueuedHtmlForSong(song) {
		var buttonType= "btn-info";
		var upOrDown= "up";
		if(song.ratioOfUpsToSkips < 0) {
			buttonType = "btn-danger";
			upOrDown= "down";
		}
		var html = '<li class="list-group-item" id="queued-song_'+song.id+'">'+
                  '<div class="song-info-list">'+
                    '<div class="song-icon song-icon-list" style="background-image: url('+song.song.imageUrl+')"></div>'+
                    '<div class="song-details song-details-list">'+
                      '<p>'+song.song.title+'</p>'+
                      '<p>'+song.song.artist+'</p>'+
                    '</div><a href="#" class="btn btn btn-default '+buttonType+' btn-lg disabled song-votes-count"><span class="glyphicon glyphicon-hand-'+upOrDown+'">'+song.ratioOfUpsToSkips+'</span></a>'+
                  '</div>'+
                '</li>';
        return html;
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

	$( window ).resize(function() {
        that.resizeQueue();
    });

    this.resizeQueue = function() {
    	$('#song-queue').css({
            height: $(window).height() - $('#header').height() - $('#player-container').height() - 35 - $('#on-top-queue').height()
        });
    }

    var htmlForInviteOthers = 
    '<div class="popover-content">'+
    	'<br />Send your friends this link:'+
    	'<input type="text" placeholder="Party Name" class="form-control" value="http://www.suchjukebox.com/party?id=1">'+
    '</div>';

    $('#invite-others-btn').popover({
  		html: true,
  		content: htmlForInviteOthers
  	});
}