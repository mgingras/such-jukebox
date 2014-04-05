/*
Handles error checking and redirection for guest looking for a party.  Also handles
finding parties tht are nearby.
*/
(function() {
  var selectedParty = null;
  var google_api_key = 'AIzaSyCGqplXIkBDqyyUeGqRssGLVGl6X84ghqU';


  $(document).on('click', '.party', function(){
    if(selectedParty){
      $(selectedParty).removeClass('active');
    }
    $(this).addClass('active');
    selectedParty = this;
  });

  $('#join').on('click', function(){
    if(selectedParty == null){
      $('#warn').css('display', 'block');
      $('#parties').css('border', '3px solid #b94a48');
      return;
    }
    var partyID = selectedParty.id;
    partyID = partyID.match(/[0-9]*$/)[0];
    $.post('/party/'+partyID+'/becomeGuest', function(data){
      if(data)
        alert(data);
      else{
        window.location.replace('/party/' + partyID + '/');
      }
    });
  });

  $('#find').on('click', function(){
    $('.location').css('color', '#eb9316');
    $('#locationName').html("Searching...");
    getLocation(function(location){
      if(location != null){
        $.get('/party/nearby', {location:location}, function(parties){
          updateParties(parties);
        });
      }
    });
  });

  $('#search').on('click', function(){
    var name = $('#partyName').val();
    if(name.length > 0){
      $('#name-label').css('display', 'none');
      $('#name-group').removeClass('has-error');
      $('#search').css('border', '#DDDDDD 1px solid');
      $.get('/party/search', {partyName: name}, function(parties){
        updateParties(parties);
        $('#partyKeyword').html('Parties Found');
      });
    }
    else{
      $('#name-label').css('display', 'block');
      $('#name-group').addClass('has-error');
      $('#search').css('border', '#a94442 1px solid');
    }
  });

  $(document).bind('keypress', function(e){
    if(document.activeElement.id !== "partyName"){
      if(e.charCode === 13){
        return $('#join').click();
      }
    }
  });

  $('#partyName').bind('keypress',function(e){
    if(e.charCode === 13){
      return $('#search').click();
    }
  });


  var getLocation = function(callback){
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(function(position){
      var location = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
      }
      // Set location
      revGeocode(location, function(where){
        $('#locationName').html(where);
        $('.location').css('color', '#5cb85c');
        $('#partyKeyword').html('Parties Nearby<small> 25Km<small style="color:white;"> (Closest first)</small></small>');
      });
      callback(location);
    });
    }
    else{
      $('#locationName').html("Unknown")
    }
  }
  var revGeocode = function(location, callback){
    var baseURL = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=';
    var sensor = '&sensor=false&key=' + google_api_key;

    $.getJSON(baseURL + location.lat + ',' + location.lon + sensor, function(resp) {
      if(resp.status != 'OK')
        callback();

      respGranularity = resp.results[resp.results.length-3];
      callback(respGranularity.address_components[0].long_name + ', ' + respGranularity.address_components[respGranularity.address_components.length - 1].short_name);
    });
  }

  var updateParties = function(parties){
    if(parties.error){
      return;
    }
    var html = '';
    if(parties.length === 0){
      html += '<a class="list-group-item">No Parties Found...</a>';
    }
    parties.forEach(function(party){
      html += '<a id="party_' + party.id + '" class="list-group-item party">'+
              party.name + '</a>';
    });
    $('#parties').html(html);
  }
}).call(this);