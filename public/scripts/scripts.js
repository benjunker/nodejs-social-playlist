//These are the scipts for my 'superuser' page (ie - my page that can call the majority of my 
//http routes)
//It remains for debugging purposes

// app.put('/room/:roomname', doCreateRoom);
// app.get('/room/:roomname', doRetrieveRoom);
// app.delete('/room/:roomname', doDeleteRoom);
// app.post('/room/:roomname/:song', doAddSong);
// app.post('/room/:roomname/static/next', doNextSong);
// app.post('/room/:roomname/:song/upvote', doUpvoteSong);
// app.post('/room/:roomname/:song/downvote', doDownvoteSong);
// app.post('/room/:roomname/static/reorder', doReorderSong)

$(function (){
	$("#doCreateRoom").submit(function(event){
		var values = $("#doCreateRoom input").val();
		$.ajax({
			    url: 'room/' + values,
			    type: 'PUT',
			    success: function(result) {
			      $("#response").html(result);
			      }
			    });
		event.preventDefault();
	});
});

$(function (){
	$("#doRetrieveRoom").submit(function(event){
		var values = $("#doRetrieveRoom input").val();
		$.ajax({
			    url: 'room/' + values,
			    type: 'GET',
			    success: function(result) {
			      $("#response").html(result);
			      }
			    });
		event.preventDefault();
	});
});

$(function (){
	$("#doDeleteRoom").submit(function(event){
		var values = $("#doDeleteRoom input").val();
		$.ajax({
			    url: 'room/' + values,
			    type: 'DELETE',
			    success: function(result) {
			      $("#response").html(result);
			      }
			    });
		event.preventDefault();
	});
});

$(function (){
	$("#doAddSong").submit(function(event){
		var values = $("#doAddSong input").serializeArray();
		var roomname = values[0].value;
		var songName = values[1].value;
		var songURL = values[2].value;
		var songInfo = {"songName": songName, "songURL": songURL};
		$.ajax({
			    url: 'room/' + roomname,
			    type: 'POST',
			    data: {"songInfo": songInfo},
			    success: function(result) {
			      $("#response").html(result);
			      }
			    });
		event.preventDefault();
	});
});

$(function (){
	$("#doNextSong").submit(function(event){
		var values = $("#doNextSong input").serializeArray();
		var roomname = values[0].value;
		$.ajax({
			    url: 'room/' + roomname + '/static/next',
			    type: 'POST',
			    success: function(result) {
			      $("#response").html(result);
			      var iframeElement   = document.querySelector('iframe');
						var widget         = SC.Widget(iframeElement);
						// var temp_url = "https://soundcloud.com/matoma-official/matoma-nelsaan-free-fallin-remix"
						widget.load(result, { auto_play: true});
			      }
			    });
		event.preventDefault();
	});
});

$(function (){
	$("#doUpvoteSong").submit(function(event){
		var values = $("#doUpvoteSong input").serializeArray();
		var roomname = values[0].value;
		var song = values[1].value;
		$.ajax({
			    url: 'room/' + roomname + '/upvote',
			    type: 'POST',
			    data: {"song_url": song},
			    success: function(result) {
			      $("#response").html(result);
			      }
			    });
		event.preventDefault();
	});
});

$(function (){
	$("#doDownvoteSong").submit(function(event){
		var values = $("#doDownvoteSong input").serializeArray();
		var roomname = values[0].value;
		var song = values[1].value;
		$.ajax({
			    url: 'room/' + roomname + '/downvote',
			    type: 'POST',
			    data: {"song_url": song},
			    success: function(result) {
			      $("#response").html(result);
			      }
			    });
		event.preventDefault();
	});
});

$(function (){
	$("#doReorderSong").submit(function(event){
		var values = $("#doReorderSong input").serializeArray();
		var roomname = values[0].value;
		$.ajax({
			    url: 'room/' + roomname + '/static/reorder',
			    type: 'POST',
			    success: function(result) {
			      $("#response").html(result);
			      }
			    });
		event.preventDefault();
	});
});

