var main = function(){
    setInterval(function(){ 
      /// show login users 
      $.ajax({
        url:"/topUrl",
        error : function () {
              $("#topUrl").empty();
              $("#topUrl").text("error ajax call");
        },dataType: "json",
        success: function (data) {
              $("#topUrl").empty();
              console.log('in client ~ topUrl data:'+data);
              var result = JSON.parse(data);
              if(result.length > 0){
                var shortUrl;
                result.forEach(function(element){
                    shortUrl = element.id.toString(36);
                    $('#topUrl').
                    append('<p>Request <span>'+element.frequency+' times is </span><a href="/'+shortUrl+'"> localhost:5000/'+shortUrl+'</a></span></p>');
                  });
              }else{
                $('#topUrl').append('<h5>no url here</h5>');
              } 
        },type: "post"
      })}, 3000);
};
 var getShortURL = function(){
      var enteredUrl = $.trim($('#url').val());
      console.log(enteredUrl);
      if(enteredUrl.indexOf('://') !== -1){
         enteredUrl = enteredUrl.substr(enteredUrl.indexOf('://')+3);
         $('#url').val(enteredUrl);
      }
      console.log('enteredUrl after remove protocal:'+$('#url').val());
      
      var MIN_URL_TO_SHORTEN=20;
  
       if(enteredUrl === ''){
          $('#originalToShortdetail').html("<h3>Please enter the long URL</h3>");
       }else if(enteredUrl.length <= MIN_URL_TO_SHORTEN){
          $('#originalToShortdetail').html("<h3>URL is allready short. We shorten URL when its size 20 or more</h3>");
       } else {
          $('#originalToShortdetail').html("<h3>please wait</h3>");
          $.ajax({
            url:"/urlShortener",
            error : function () {
                      $("#originalToShortdetail").empty();
                      $('#originalToShortdetail').html('<h3>You have entered not found URL<h3>');
                      $("#originalToShortdetail").text("error ajax call");
            },dataType: "json",
            data:$( "#url" ).serialize(),
            success: function (data) {
              console.log("data:"+data);
              var result = JSON.parse(data);
              console.log("id:"+result.id);
              var shortUrl = result.id.toString(36);
              $('#originalToShortdetail').html('<p>URL:'+result.url+'</p>'+
              '<p>shorten:<a href="/'+shortUrl+'">localhost:5000/'+shortUrl+'</a></p>');
            },type: "post"
          });
          $('#url').val("");
        }
    return false;
 };
var getOriginalURL = function(){
      var enteredUrl = $.trim($('#shortUrl').val());
      console.log(enteredUrl);
      if(enteredUrl.indexOf('localhost:5000/') !== -1){
         enteredUrl = enteredUrl.substr(enteredUrl.indexOf('localhost:5000/')+15);
         $('#shortUrl').val(enteredUrl);
      }
      console.log('shortUrl after remove protocal:'+$('#shortUrl').val());
      
       if(enteredUrl === ''){
          $('#shortToOriginaldetail').html("<h3>Please enter the short URL</h3>");
       } else {
          $('#shortToOriginaldetail').html("<h3>please wait</h3>");
          $.ajax({
            url:"/originalURL",
            error : function () {
                      $("#shortToOriginaldetail").empty();
                      $('#shortToOriginaldetail').html('<h3>You have entered not found URL<h3>');
                      $("#shortToOriginaldetail").text("error ajax call");
            },dataType: "json",
            data:$( "#shortUrl" ).serialize(),
            success: function (data) {
              console.log("data:"+data);
              var result = JSON.parse(data);
              var shortUrl = result.id.toString(36);
              $('#shortToOriginaldetail').html('<p>shorten URL:'+shortUrl+'</p>'+
              '<p>shorten:<a href="http://'+result.url+'">'+result.url+'</a></p>');
            },type: "post"
          });
          $('#shortUrl').val("");
        }
    return false;
 };
$('#shortenBtn').click(getShortURL);
$('#originalBtn').click(getOriginalURL);
 
$(document).ready(main);
