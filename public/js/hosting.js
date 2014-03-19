(function() {
  $('#location').bootstrapSwitch('state'); // whether to use locaiton
  var partyLocation = null;

  $('#location').on('switchChange', function(e, data) {
    if(data.value){
      getLocation();
    }
    else{
      partyLocation = null;
    }
  });

  for(var genreId in Genres) {
    var genreName = Genres[genreId];
    $('#fallback').append('<option value="'+genreId+'">'+genreName+'</option>');
  }

  $('#host').on('click', function(){
    var partyName = $('#partyName').val();
    var validName = partyName.length > 0;
    var genreID = $( "#fallback option:selected" ).val();
    var validGenre = genreID != null && genreID != "";

    if(!validName){
      $('#nameWarn').css('display', 'block');
    }
    else{
      $('#nameWarn').css('display', 'none');
    }
    if(!validGenre){
      $('#fallbackWarn').css('display', 'block');
    }
    else{
      $('#fallbackWarn').css('display', 'none');
    }
    if(validName && validGenre){
      $.post('/hostParty', {name: partyName, genreId: genreID, location: partyLocation}, function(data){
        console.dir(data);
        window.location.replace('/party/' + data.partyId);
      });
    }

  })
  var getLocation = function(){
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(function(position){
        partyLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        console.dir(partyLocation);
      });
      }
      else{
        alert("Geolocation is not supported by this browser.");
      }
  }
}).call(this);