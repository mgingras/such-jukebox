(function() {
  var selectedParty = null;
  var location = null;
  var google_api_key = 'AIzaSyCK0OyxfiEJke5f5Z7xYxMN9MFs21jT-5Y';

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

  $('#search').on('click', function(){
    var name = $('#partyName').val();
    if(name.length > 0){
      $('#name-label').css('visibility', 'hidden');
      $('#name-group').removeClass('has-error');
      $('#search').css('border', '#DDDDDD 1px solid');
      console.log("Party Name: " + name);
      $.get('/party/search', {partyName: name}, function(data){
        var html = '';
        console.log(data.length);
        if(data.length === 0){
          console.log('here');
          html += '<a class="list-group-item">No Parties Found...</a>';
        }
        console.log(html);
        data.forEach(function(party){
          html += '<a id="party_' + party.id + '" class="list-group-item party">'+
                  party.name + '</a>';
        });
        console.log(html);
        $('#partyKeyword').html('Parties Found');
        $('#parties').html(html);
      });
    }
    else{
      $('#name-label').css('visibility', 'visible');
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
        $('#partyKeyword').html('Parties Nearby');
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