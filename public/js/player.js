Player = function(isHost) {
	var that = this;
	var queuedSongs = [];
	var playedSongs = []; 
	var currentSong;
	var currentSongPercentDone = 0;
	var isPlaying;
	var partyId;
	var votedForSongs = {};

	if( ! isHost ) {
		$('.host-only').hide();
		$('#player').remove(); 
	} else {
		$('.guest-only').hide();
	}

	this.initializeFromParty = function(party) {
		partyId = party.id;
		playedSongs = party.playedSongs;
		if(party.currentSong)
			currentSong = party.currentSong;

		that.addSongsToQueue(party.queuedSongs);
	}

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
		informServerOfSongChange(currentSong, newSong);

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

		updateUIState();
		updateSongProgressUI();
	}

	function informServerOfSongChange(oldSong, newSong) {
		var data = {};
		if(oldSong) {
			data.oldSongId = oldSong.id;
		}

		if(newSong) {
			data.newSongId = newSong.id;
		}

		$.post( "/party/"+partyId+"/updateCurrentSong", data, function( data ) {
			if(data.party) {
				handleNewPartyState(data.party);
			}
		});
	}

	function handlePlay() {
		if(!isHost)
			return;

		$('#play-btn').hide();
		$('#pause-btn').show();
		$('#current-song-progress').addClass('active');
		isPlaying = true;
		$('#player').get(0).play();
	}

	function handlePause() {
		if(!isHost)
			return;

		$('#play-btn').show();
		$('#pause-btn').hide();
		$('#current-song-progress').removeClass('active');
		$('#player').get(0).pause();
		isPlaying = false;
	}


	$('#next-song-btn').click(function() {
		that.nextSong();
	});

	$('#pause-btn').click(function() {
		handlePause();
	});

	$('#play-btn').click(function() {
		handlePlay();
	});

	this.getQueuedSongById = function(songQueueId) {
		for(var i in queuedSongs) {
			if(''+queuedSongs[i].id === ''+songQueueId) {
				return queuedSongs[i];
			}
		}
		return undefined;
	}

	function updateUIState() {
		if(queuedSongs.length === 0) {
			$('#next-song-btn').addClass('disabled');
		} else {
			$('#next-song-btn').removeClass('disabled');
		}
		updatePendingQueueUI();
		updateCurrentSongUI();
	}

	function updatePendingQueueUI() {
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

	function updateCurrentSongUI() {
		if(!currentSong)
			return;

		$('#current-song-title').text(currentSong.song.title);
		$('#current-song-artist').text(currentSong.song.artist);
		$('#current-song-icon').css({
			'background-image': 'url('+currentSong.song.imageUrl+')'
		});
	}

	function getQueuedHtmlForSong(song) {
		var buttonType= "btn-info";
		var upOrDown= "up";
		if(song.ratioOfUpsToSkips < 0) {
			buttonType = "btn-danger";
			upOrDown= "down";
		}

		var voteDisabled = '';
		if(votedForSongs[song.id]) {
			voteDisabled = 'disabled';
		}

		var html = '<li class="list-group-item queued-song-item" id="queued-song_'+song.id+'" data-song-queue-id="'+song.id+'">'+
                  '<div class="song-info-list">'+
                    '<div class="song-icon song-icon-list" style="background-image: url('+song.song.imageUrl+')"></div>'+
                    '<div class="song-details song-details-list">'+
                      '<p>'+song.song.title+'</p>'+
                      '<p>'+song.song.artist+'</p>'+
                    '</div>'+
                    '<div class="queue-list-votes">'+
                    	'<div class="song-votes-controls">'+
                    		'<a href="#" onclick="javascript: player.voteSong('+song.id+', false)" class="btn btn btn-success btn-xs vote-song-up-btn '+voteDisabled+'" style="margin-bottom: 2px;"><span class="glyphicon glyphicon-hand-up"></span></a><br />'+
                   	 		'<a href="#" onclick="javascript: player.voteSong('+song.id+', true)" class="btn btn btn-danger btn-xs vote-song-down-btn '+voteDisabled+'"><span class="glyphicon glyphicon-hand-down"></span></a>'+
                  		'</div>'+
                  		'<a href="#" class="btn btn btn-default '+buttonType+' btn-lg disabled song-votes-count"><span class="glyphicon glyphicon-hand-'+upOrDown+'">'+song.ratioOfUpsToSkips+'</span></a>'+
                  	'</div>'+
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

    this.voteSong = function(songQueueId, isVoteDown, elem) {
    	console.log(elem);
    	var song = that.getQueuedSongById(songQueueId);
    	if(!song) {
    		return;
    	}

    	$('#queued-song_'+songQueueId).find('.vote-song-up-btn').addClass('disabled');
    	$('#queued-song_'+songQueueId).find('.vote-song-down-btn').addClass('disabled');

    	if(isVoteDown) {
    		song.ratioOfUpsToSkips--;
    	} else{
    		song.ratioOfUpsToSkips++;
    	}

    	votedForSongs[songQueueId] = true;

    	updatePendingQueueUI();

    	$.post( "/party/"+partyId+"/voteSong", {songQueueId: songQueueId, isVoteDown: isVoteDown === true}, function( data ) {
		});
    }

    function getSongQueueIdFromSongQueueListItemElement(element) {
    	var parent = element.closest('.queued-song-item');

    	if(! parent) {
    		return null;
    	}

    	var songQueueId = parent.attr('data-song-queue-id');
    	if(! songQueueId )
    		return null;

    	return songQueueId;
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

  	$(document).keypress(function(e) {
	    if(e.which == 32) {
	        if(isPlaying) {
	        	handlePause();
	        } else{
	        	handlePlay();
	        }
	    }
	});


	function receiveUpdatedParty() {
		$.post( "/party/"+partyId+"/newState", function( data ) {
			if(data.error || ! data.party)
				return;
			handleNewPartyState(data.party)
			
		});
	}

	function handleNewPartyState(party) {
		if(!isHost && party.currentSong) {
			var newCurrentSong = that.getQueuedSongById(party.currentSong.id);
			if(newCurrentSong) {
				currentSong = newCurrentSong;
			}
		}

		queuedSongs = party.queuedSongs;
		playedSongs = party.playedSongs;

		updateUIState();
	}

	var updateTimer = setInterval(receiveUpdatedParty,5000);
}