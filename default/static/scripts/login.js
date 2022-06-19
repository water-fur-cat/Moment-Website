$('.message a').click(function(){
  $('form').animate({height: "toggle", opacity: "toggle"}, "slow");
})

function password_equal() {
  const password = document.getElementById("signup-password").value;
  const reentered_password = document.getElementById("signup-repassword").value;
  if (password != reentered_password) {
      alert("Password and Re-entered password must not be equal!");
      return false;
  };
}

$('#signup-username').keyup(function() {
  var username = $('#signup-username').val();
  const check_username_url = $('#check_username_url').text();
  if (username == '') {
    $('#username_status').html('');
  } else {
    fetch(check_username_url+'?q='+username, {
      method: 'GET',
      headers: {'X-Api-Key': 'abcdef123456'},
    }).then((response) => {
      return response.json();
    }).then((response_body) => {
      if (response_body["exist"] == "True") {
        $('#username_status').html('Username already exists');
      } else {
        $('#username_status').html('Valid username');
      }
    }).catch((response) => {
      console.log(response);
    });
  }
})

