var selectedParty = null;
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