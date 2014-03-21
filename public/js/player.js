(function() {
  SC.initialize({
    client_id: '37b3e407ce25c7ef03fe4ff665e40961'
  });

  


  Player = function(isHost) {
  var that = this;
  var queuedSongs = [];
  var playedSongs = [];
  var currentSong;
  var currentSongPercentDone = 0;
  var isPlaying;
  var partyId;
  var votedForSongs = {};
  var songCache = {};
  var party;
  var fallbackTrackQueue = {};

  if( ! isHost ) {
    $('.host-only').hide();
    $('#next-song-btn').append('Skip');
  } else {
    $('.guest-only').hide();
  }


  this.initializeFromParty = function(_party) {
    party=new Party(_party);
    partyId = party.id;
    playedSongs = party.playedSongs;
    if(party.currentSong){
      handleChangeToSong(party.currentSong);
    }
	
    updateUIState();
    that.addSongsToQueue(party.queuedSongs);

    if(isHost)
      addMoreSongsIfNeeded();
  }

  this.addSongToQueue = function(song) {
    populateSoundCloudInfoToQueuedSong(song, updateSongInfoUIForQueuedSong);
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
      if(currentSong){
        informServerOfSongChange(currentSong);
        if(currentSong.sound)
          currentSong.sound.stop();
        playedSongs.push(currentSong);
        currentSong = undefined;
      }

      return;
    }

    var song = queuedSongs.shift();
    console.log('Skipping song to  ' + JSON.stringify(song));

    handleChangeToSong(song);

  }

  function handleChangeToSong(newSong) {

    if(isHost)
      informServerOfSongChange(currentSong, newSong);

    if(currentSong) {
      if(currentSong.sound) {
        currentSong.sound.stop();
      }

      playedSongs.push(currentSong);
    }
    currentSong = newSong;
    currentSongPercentDone = 0;

    
    populateSoundCloudInfoToQueuedSong(newSong, updateCurrentSongUI);

    if(isHost) {
      SC.stream("/tracks/"+newSong.song.trackid, function(sound){
        newSong.sound = sound;
        handlePlayPause();
      });
    }


    updateUIState();
    updateSongProgressUI();
  }

  function populateSoundCloudInfoToQueuedSong(queuedSong, callback) {
    if(queuedSong.didGetSoundCloudInfo)
      return;

    console.log('About to make soundcloud call for song ['+queuedSong.id+']');
    SC.get("/tracks/"+queuedSong.song.trackid, function(track){
       console.log('Got response soundcloud call for song ['+queuedSong.id+']');
      console.log(track);
      queuedSong.song.title=track.title;
      queuedSong.song.artist=track.user !== undefined ? track.user.username : "";
      queuedSong.song.imageUrl=track.artwork_url;
      queuedSong.didGetSoundCloudInfo = true;


      songCache[queuedSong.song.trackid] = queuedSong.song;

      if(callback)
        callback(queuedSong);
    });
  }

  function handlePlayPause() {
    if(!currentSong)
      return;

    if( !isHost || !currentSong.sound )
      return;

    if(isPlaying) {
      currentSong.sound.play({
        whileplaying: function(){
          that.updateTimeOfCurrentSong(this.position, this.duration);
        }
      });
    } else{
      currentSong.sound.pause();
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
    handlePlayPause();
  }

  function handlePause() {
    if(!isHost)
      return;

    $('#play-btn').show();
    $('#pause-btn').hide();
    $('#current-song-progress').removeClass('active');
    isPlaying = false;
    handlePlayPause();
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
    if(!currentSong){
      return;
    }

    var title = "";
    var artist = "";
    var bgUrl = "";

    if(currentSong) {
      title = currentSong.song.title;
      artist = currentSong.song.artist;
      bgUrl = currentSong.song.imageUrl;
    }

    $('#current-song-title').text(title);
    $('#current-song-artist').text(artist);
    $('#current-song-icon').css({
      'background-image': 'url('+bgUrl+')'
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

    var title = song.song.title !== undefined ? song.song.title : "";
    var artist = song.song.artist !== undefined ? song.song.artist : "";
    var imageUrl = song.song.imageUrl !== undefined ? song.song.imageUrl : "";

    var html = '<li class="list-group-item queued-song-item" id="queued-song_'+song.id+'" data-song-queue-id="'+song.id+'">'+
    '<div class="song-info-list">'+
    '<div class="song-icon song-icon-list" id="queued-song_'+song.id+'_image" style="background-image: url('+imageUrl+')"></div>'+
    '<div class="song-details song-details-list">'+
    '<p id="queued-song_'+song.id+'_title">'+title+'</p>'+
    '<p id="queued-song_'+song.id+'_artist">'+artist+'</p>'+
    '</div>'+
    '<div class="queue-list-votes">'+
    '<div class="song-votes-controls">'+
    '<a onclick="javascript: player.voteSong('+song.id+', false)" class="btn btn btn-success btn-xs vote-song-up-btn '+voteDisabled+'" style="margin-bottom: 2px;"><span class="fa fa-thumbs-up"></span></a><br />'+
    '<a onclick="javascript: player.voteSong('+song.id+', true)" class="btn btn btn-danger btn-xs vote-song-down-btn '+voteDisabled+'"><span class="fa fa-thumbs-down"></span></a>'+
    '</div>'+
    '<a class="btn btn btn-default '+buttonType+' btn-lg disabled song-votes-count"><span class="fa fa-thumbs-'+upOrDown+'">'+song.ratioOfUpsToSkips+'</span></a>'+
    '</div>'+
    '</div>'+
    '</li>';
    return html;
  }

  function getSearchResultHtmlForSong(song) {
    var title = song.title !== undefined ? song.title : "";
    var artist = song.artist !== undefined ? song.artist : "";
    var imageUrl = song.imageUrl !== undefined ? song.imageUrl : "";

    var html = '<li class="list-group-item queued-song-item" id="search-result-song_'+song.trackid+'" data-song-track-id="'+song.trackid+'">'+
    '<div class="song-info-list">'+
    '<div class="song-icon song-icon-list" id="search-result_'+song.trackid+'_image" style="background-image: url('+ imageUrl+')"></div>'+
    '<div class="song-details song-details-list">'+
    '<p id="search-result-song_'+song.trackid+'_title">'+title+'</p>'+
    '<p id="search-result-song_'+song.trackid+'_artist">'+artist+'</p>'+
    '</div>'+
    '<div class="queue-list-votes">'+
    '<a class="btn btn-info btn-lg add-song-btn" data-song-track-id="'+song.trackid+'"><span class="fa fa-plus"></span>Add</a>'+
    '</div>'+
    '</div>'+
    '</li>';
    return html;
  }

  function updateSongInfoUIForQueuedSong(queuedSong) {
    $('#queued-song_'+queuedSong.id+'_title').text(queuedSong.song.title);
    $('#queued-song_'+queuedSong.id+'_artist').text(queuedSong.song.artist);
    $('#queued-song_'+queuedSong.id+'_image').css({'background-image': 'url('+queuedSong.song.imageUrl+')'});
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
  if(currentTime === undefined || duration === undefined)
    return;

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

updatePendingQueueUI();


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
  $('#searchResultList').empty();
  SC.get('/tracks', { q: query }, function(tracks) {
    console.log(tracks);
    changeSearchResults(tracks);
  });
}

function changeSearchResults(tracks) {
  var searchContainer = $('#searchResultList');
  searchContainer.empty();
  for(var i in tracks) {
    var track = tracks[i];
    var song = {};
    populateSongFromTrack(song, track);
    var html = getSearchResultHtmlForSong(song);
    searchContainer.append(html);
  }
}

function populateSongFromTrack(song, track) {
  song.title=track.title;
  song.artist=track.user !== undefined ? track.user.username : "";
  song.imageUrl=track.artwork_url;
  song.trackid=track.id;
  songCache[song.trackid] = song;
}



  /*
    Guest Specific
   */

 function handleVoteSkip() {
    if(!currentSong)
     return;
     
    if(currentSong.userVotedToSkip == true){
      return;
    }

   if(currentSong.numVotesToSkip === undefined)
     currentSong.numVotesToSkip=0;
   currentSong.numVotesToSkip++;

   currentSong.userVotedToSkip = true;

   $('#vote-skip-song-btn').addClass('disabled');
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

    for(var i in queuedSongs) {
      var qs = queuedSongs[i];
      var cachedSong = songCache[qs.song.trackid];
      if(cachedSong){
        qs.song = cachedSong;
        qs.didGetSoundCloudInfo = true;
      } else{
        populateSoundCloudInfoToQueuedSong(qs, updateSongInfoUIForQueuedSong);
      }
    }

    if(party.currentSong !== undefined && currentSong != undefined && party.currentSong.id !== currentSong.id && getQueuedSongById(party.currentSong.id) !== undefined) {
      handleChangeToSong(party.currentSong);
    } else if(party.currentSong !== undefined && currentSong != undefined) {
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

  function addTrackToQueue(trackid) {
    var data = {
      trackid: trackid
    }
    $.ajax({
      type: 'POST',
      url: "/party/"+partyId+"/queueSong",
      data: data,
      success: function( data ) {
        if(data.party) {
          handleNewPartyState(data.party);
        }
      },
      async:true
    });
  }

  function addMoreSongsIfNeeded() {
    if(queuedSongs.length < 3) {
      addMoreSongs();
    }
  }

  function addMoreSongs() {
    var genreName = Genres[party.genreId];
    if(!genreName) {
      console.log("Genre ID for the party is not defined");
      return;
    }

    if(Object.keys(fallbackTrackQueue).length > 2) {
      queueSongsFromFallbackQueue();
      return;
    }

    genreName = genreName.toLowerCase();

    // We need to specify a query for getting songs so this is a whacky
    // way of getting a random song

    var alphabet = "abcdefghijklmnopqrstuvwxyz";
    var randomLetter = ''+alphabet.charAt(getRandom(0, alphabet.length-1));
    var randomStartLength = getRandom(120000, 180000);  
    var randomEndLength = getRandom(200000, 360000);


    SC.get("/tracks/", {genres: genreName, q:randomLetter, duration: {from: randomStartLength, to: randomEndLength}},  function(tracks){
      var z = 0;
      for(var i in tracks) {
        var track = tracks[i];
        var trackid = track.id;

        if(isTrackAlreadyPlayedOrQueued(trackid))
          continue;

        var song = {};
        populateSongFromTrack(song, track);
        songCache[trackid] = song;
        fallbackTrackQueue[trackid] = true;

        if(z>=4)
          break;
        z++;
      }
      queueSongsFromFallbackQueue();
    });
  }

  function getRandom(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function queueSongsFromFallbackQueue() {
    var z = 0;


    for(var z = 0; z<3; z++){
      var keys = Object.keys(fallbackTrackQueue);
      if(keys.length == 0)
        break;

      var randomKey = keys[getRandom(0, keys.length)];

      delete fallbackTrackQueue[randomKey];
      addTrackToQueue(randomKey);
    }
  }

  function isTrackAlreadyQueued(trackid) {
    for(var i in queuedSongs) {
      var qs = queuedSongs[i];
      if(qs.song.trackid == trackid) {
        return true;
      }
    }

    if(currentSong && trackid == currentSong.song.trackid)
      return true;
    return false;
  }

  function isTrackAlreadyPlayed(trackid) {
    for(var i in playedSongs) {
      var qs = playedSongs[i];
      if(qs.song.trackid == trackid) {
        return true;
      }
      return false;
    }
  }

  function isTrackAlreadyPlayedOrQueued(trackid){
    var isQueued = isTrackAlreadyQueued(trackid);
    if(isQueued)
      return true;

    return isTrackAlreadyPlayed(trackid);
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


  var updateTimer = setInterval(receiveUpdatedParty,5000);

  if(isHost){
    var fallbackSongsTimer = setInterval(addMoreSongsIfNeeded,5000);
  }


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

  $(document).on('click', '.add-song-btn', function() {
    var trackid = $(this).attr('data-song-track-id');
    console.log(trackid);
    if(!trackid)
      return;

    addTrackToQueue(trackid);
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