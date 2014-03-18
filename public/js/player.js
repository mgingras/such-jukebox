(function() {
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
    $('#next-song-btn').append('Skip');
  } else {
    $('.guest-only').hide();
  }

  //TODO REMOVE


  this.initializeFromParty = function(party) {
    partyId = party.id;
    playedSongs = party.playedSongs;
    if(party.currentSong){
      currentSong = party.currentSong;
      resetPlayerWithCurrentSong();
    }
      updateUIState();
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
  this.disableVotedFor = function(votes){
    if(!isHost){
      var voted = votes.votedFor;
      var votesToSkip = votes.votedToSkip;

      for (var i = 0; i < voted.length; i++) {
        if(voted[i] != null){
          votedForSongs[i] = true;
        }
      }
      if(currentSong == null){
        $('#vote-skip-song-btn').addClass('disabled');
      }
      else if(votesToSkip[currentSong.id] != null){
        currentSong.userVotedToSkip = true;
        $('#vote-skip-song-btn').addClass('disabled');
      }
    }
  }

  function handleChangeToSong(newSong) {
    informServerOfSongChange(currentSong, newSong);

    if(currentSong) {
      playedSongs.push(currentSong);
    }
    currentSong = newSong;
    currentSongPercentDone = 0;

    resetPlayerWithCurrentSong();

    updateUIState();
    updateSongProgressUI();
  }

  function resetPlayerWithCurrentSong() {
    $('#player').empty();
    $('#player').append('<source src="'+currentSong.song.fileLocation+'" type="audio/mp3">');
    if(isPlaying) {
      $('#player').get(0).play();
    }
  }

  function informServerOfSongChange(oldSong, newSong) {
    var data = {};
    if(oldSong) {
      data.oldSongId = oldSong.id;
    }

    if(newSong) {
      data.newSongId = newSong.id;
    }

    $.ajax({
      type: 'POST',
      url: "/party/"+partyId+"/updateCurrentSong",
      data: data,
      success: function( data ) {
        if(data.party) {
         handleNewPartyState(data.party);
       }
     },
     async:true
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
    updateVotesToSkipGui();
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
    '<div class="queue-list-votes">';

    if(!isHost){
      html += '<div class="song-votes-controls">'+
      '<a onclick="javascript: player.voteSong('+song.id+', false)" class="btn btn btn-success btn-xs vote-song-up-btn '+voteDisabled+'" style="margin-bottom: 2px;"><span class="fa fa-thumbs-up"></span></a><br />'+
      '<a onclick="javascript: player.voteSong('+song.id+', true)" class="btn btn btn-danger btn-xs vote-song-down-btn '+voteDisabled+'"><span class="fa fa-thumbs-down"></span></a>' +
      '</div>';
    }
    html += '<a class="btn btn btn-default '+buttonType+' btn-lg disabled song-votes-count"><span class="fa fa-thumbs-'+upOrDown+'">'+song.ratioOfUpsToSkips+'</span></a>'+
    '</div>'+
    '</div>'+
    '</li>';
    return html;
  }

  function updateSongProgressUI() {
    $('#current-song-progress > .progress-bar').css({width: currentSongPercentDone+'%'});
  }

  function updateVotesToSkipGui() {
    if(currentSong !== undefined) {
     if(currentSong.userVotedToSkip) {
      $('#vote-skip-song-btn').addClass('disabled');
    } else {
      $('#vote-skip-song-btn').removeClass('disabled');
    }

    if(currentSong.numVotesToSkip === undefined)
      currentSong.numVotesToSkip = 0;

    $('#song-votes-to-skip').text(currentSong.numVotesToSkip + ' votes to skip')
  }
}

this.updateTimeOfCurrentSong = function(currentTime, duration){
  currentSongPercentDone = currentTime/duration*100;

  if(currentSongPercentDone >= 100) {
   that.nextSong();
 }

 updateSongProgressUI();
}



this.resizeQueue = function() {
 $('#song-queue').css({
  height: $(window).height() - $('#header').height() - $('#player-container').height() - 35 - $('#on-top-queue').height()
});
}

this.resizeSearch = function() {
 $('#searchResultList').css({
  height: $(window).height() - 220
});
}

this.voteSong = function(songQueueId, isVoteDown) {
 var song = that.getQueuedSongById(songQueueId);
 if(!song) {
  return;
}

$('#queued-song_'+songQueueId).find('.vote-song-up-btn').addClass('disabled');
$('#queued-song_'+songQueueId).find('.vote-song-down-btn').addClass('disabled');


votedForSongs[songQueueId] = true;

queuedSongs.sort(function(a,b){
 var ratioA = a.ratioOfUpsToSkips !== undefined ? a.ratioOfUpsToSkips : 0;
 var ratioB = b.ratioOfUpsToSkips !== undefined ? b.ratioOfUpsToSkips : 0;

 return ratioB-ratioA;
});

$.post(
  "/party/"+partyId+"/voteSong",
  {songQueueId: songQueueId, isVoteDown: isVoteDown === true},
  function(data){
    if(!data.error){
      if(isVoteDown) {
        song.ratioOfUpsToSkips--;
      }
      else{
        song.ratioOfUpsToSkips++;
      }
    }
    updatePendingQueueUI();
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

function goToSearch() {
 $('.player-only-elem').hide();
 $('.search-only-elem').show();
}

function goToPlayer() {
 $('.player-only-elem').show();
 $('.search-only-elem').hide();
}

this.goToPlayer = goToPlayer;
this.goToSearch = goToSearch;


function searchForSongs(query) {

}

  /*
    Guest Specific
   */

   function handleVoteSkip() {
    if(currentSong.userVotedToSkip == true){
      return;
    }
    if(!currentSong)
     return;

   if(currentSong.numVotesToSkip === undefined)
     currentSong.numVotesToSkip=0;
   currentSong.numVotesToSkip++;

   currentSong.userVotedToSkip = true;

   $.ajax({
    type: 'POST',
    url: "/party/"+partyId+"/voteToSkipCurrentSong",
    data: {songQueueId: currentSong.id},
    success: function( data ) {
      if(data.party) {
       handleNewPartyState(data.party);
     }
   },
   async:true
 });
   updateVotesToSkipGui();

 }


  /*
    Server updates
   */

   function receiveUpdatedParty() {
    $.ajax({
      type: 'POST',
      url: "/party/"+partyId+"/newState",
      success: function( data ) {
        if(!data.error && data.party) {
         handleNewPartyState(data.party);
       }
     },
     async:true
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

  if(party.currentSong !== undefined && party.currentSong.id !== currentSong.id && getQueuedSongById(party.currentSong.id) !== undefined) {
   handleChangeToSong(party.currentSong);
 } else if(party.currentSong !== undefined) {
   currentSong.numVotesToSkip = party.currentSong.numVotesToSkip;
 }

 if(isHost) {
  if(currentSong){
     if(currentSong.numVotesToSkip > 3) {
      that.nextSong();
    }
  }
}

updateUIState();
}


var updateTimer = setInterval(receiveUpdatedParty,5000);


  /*
    Event Listeners
   */

   $(document).keypress(function(e) {
     if(e.which == 32) {
       if(isPlaying) {
        handlePause();
      } else{
        handlePlay();
      }
    }
  });

   $( window ).resize(function() {
    that.resizeQueue();
    that.resizeSearch();
  });

   $('#next-song-btn').click(function() {
    that.nextSong();
  });

   $('#pause-btn').click(function() {
    handlePause();
  });

   $('#play-btn').click(function() {
    handlePlay();
  });

   $('#vote-skip-song-btn').click(function() {
    handleVoteSkip();
  });

   $('#search-songs-button').click(function() {
    searchForSongs($('#search-songs-input').val());
  });


  /*
    Perform on creation
    class="popover-content" style="color:#00B7FF;
   */

    var htmlForInviteOthers = '<div class="popover-content"><div class="share-box">'+
    '<div class="col-xs-4">'+
    '<a href="https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(window.location.toString())+'" target="_blank">'+
      '<i class="fa fa-facebook-square fa-2x" style="color:#00B7FF;"></i>'+
    '</a>'+
    '</div>'+ // col
    '<div class="col-xs-4">'+
    '<a href="https://twitter.com/intent/tweet?text=Start%20controlling%20the%20playlist%20for%20my%20party!%20Go%20to:&url='+encodeURIComponent(window.location.toString())+'" target="_blank">'+
      '<i class="fa fa-twitter-square fa-2x" style="color:#00B7FF;"></i>'+
    '</a>'+
    '</div>'+ // col
    '<div class="col-xs-4">'+
    '<a href="mailto:?subject=Join%20my%20party%20at%20Such%20Jukebox!!!&body=Start%20controlling%20the%20playlist%20for%20my%20party!%20Go%20to:%20'+window.location.toString()+'">'+
      '<i class="fa fa-envelope fa-2x" style="color:#00B7FF;"></i>'+
    '</a>'+
    '</div>'+ // col
  '</div>'+ // container
  '</div>';

   $('#invite-others-btn').popover({
    html: true,
    content: htmlForInviteOthers
  });

   this.resizeSearch();
 }
}).call(this);