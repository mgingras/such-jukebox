(function() {
  var selectedParty = null;
  var location = null;
  var google_api_key = 'AIzaSyCK0OyxfiEJke5f5Z7xYxMN9MFs21jT-5Y';

  $('.party').on('click', function(){
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
      console.dir(data);
      if(data)
        alert(data);
      else{
        window.location.replace('/party/' + partyID);
      }
    });
  });


  $('#find').on('click', function(){
    $('.location').css('color', '#eb9316');
    $('#locationName').html("Searching...");
    getLocation();
  });


  var getLocation = function(){
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(function(position){
      location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
      // Set location
      revGeocode(location, function(where){
        $('#locationName').html(where);
        $('.location').css('color', '#5cb85c');
        $('#partyKeyword').html('Nearby')
      });
    });
    }
    else{
      $('#locationName').html("Unknown")
    }
  }
  var revGeocode = function(location, callback){
    var baseURL = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=';
    var sensor = '&sensor=false&key=' + google_api_key;
    console.log(baseURL + location.lat + ',' + location.lng + sensor);

    $.getJSON(baseURL + location.lat + ',' + location.lng + sensor, function(resp) {
      if(resp.status != 'OK')
        callback();

      // console.dir(resp);
      respGranularity = resp.results[resp.results.length-3];
      // console.dir(respGranularity);
      callback(respGranularity.address_components[0].long_name + ', ' + respGranularity.address_components[respGranularity.address_components.length - 1].short_name);
    });

  }
}).call(this);