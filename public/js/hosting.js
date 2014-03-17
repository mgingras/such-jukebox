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

  $('#host').on('click', function(){
    var fallbackGenre = $('#fallback').val()[0];
    var partyName = $('#partyName').val();
    var validName = partyName.length > 0;
    var validGenre = fallbackGenre != null;
    var genreID = undefined;

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
      switch(fallbackGenre){
        case('Top 40'):
          genreID = 0;
          break;
        case('Hip-hop'):
          genreID = 1;
          break;
        case('Rap'):
          genreID = 2;
          break;
        case('Pop'):
          genreID = 3;
          break;
      }
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