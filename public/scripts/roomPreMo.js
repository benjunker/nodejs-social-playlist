var role = 'room';
var track_array;
// ^localStorage



if (window.location.href.indexOf("rhcloud") > -1){
	var socket = io.connect("http://nodejs-bjunker.rhcloud.com:8000");
} else {
	var socket = io.connect();
}

// socket.on('players', function (data) {
//   console.log(data);
//   $("#numPlayers").text(data.number);
// });

// socket.on('welcome', function (data) {
// 	console.log(data);
// 	$('#welcome').text(data.message);
// });

socket.on('connect', function(){
	socket.emit('save_role', {'role': role});
});

socket.on('reorder', function(){
	$.ajax({
		url: 'room/' + "main_room",
		type: 'GET',
		success: function(result) {
			result = result.replace(/&#34;/g,'"');
	    	result = JSON.parse(result);
	    	// console.log(result);
	    	var html_string = '';
	    	if (result.songs.length == 0) {
	    		$('#playlistm').html("<h5 class='white-text'>Playlist:</h5><br><b class='white-text'>Nothing... Add more songs!<b>");
	    	} else {
				html_string  = html_string + '<h5 class="white-text">Playlist:</h5><br><table class="highlight white-text centered"><thead><tr><th>Song Name</th><th>Upvote</th><th>Downvote</th><th>Votes</th></tr></thead><tbody>';
				result.songs.forEach(function(songobj, index, array){
					html_string = html_string+'<tr><td><a target="_blank" href='+songobj.songInfo.songURL+' class="white-text">'+songobj.songInfo.songName+'</a></td><td>'+ '<img id="mup'+index+'" src="img/upvote.png" height="30" width="30" class="center">' + '</td><td>'+ '<img id="mdown'+ index +'" src="img/downvote.png" height="30" width="30" class="center">' +'</td><td>'+songobj.votes+'</td></tr>';
					// Upvote Image: http://i.imgur.com/HRgF1g0.png
					// Downvote Image: http://i.imgur.com/Hct09iU.png
				});
				html_string = html_string + '</tbody></table>';
				$('#playlistm').html(html_string);
				var roomname = "main_room";
				result.songs.forEach(function(songobj, index, array){
					$('#mup'+index).bind( "click", function() {
						// console.log(songobj.songInfo.songURL)
						$.ajax({
							url: 'room/' + roomname + "/upvote",
							type: 'POST',
							data: {"song_url": songobj.songInfo.songURL},
							success: function(result) {
								$.ajax({
									url: 'room/' + roomname + '/static/reorder',
									type: 'POST',
									success: function(result) {
										if (result == "no more songs"){
											return
										}
										socket.emit("reload_all_playlists");
									}
								});
							}
						});
					});
					$('#mdown'+index).bind( "click", function() {
						// console.log(songobj.songInfo.songURL)
						$.ajax({
							url: 'room/' + roomname + '/downvote',
							type: 'POST',
							data: {"song_url": songobj.songInfo.songURL},
							success: function(result) {
								$.ajax({
									url: 'room/' + roomname + '/static/reorder',
									type: 'POST',
									success: function(result) {
										if (result == "no more songs"){
											return
										}
										socket.emit("reload_all_playlists");
									}
								});
							}
						});
					});
				});
			}
		}
	});
});

socket.on('redirect_home', function(){
	window.location.replace("buffer.html");
	// later, make this a buffer page to explain why they were kicked out
});





SC.initialize({
	client_id: 'YOUR_CLIENT_ID_HERE'
});

$.ajax({
	url: 'room/' + "main_room",
	type: 'GET',
	success: function(result) {
		$("#playlistm").html(result);
	}
});

$(function (){
	$("#doSearchm").submit(function(event){
		var values = $("#doSearchm input").serializeArray();
		var roomname = "main_room";//values[0].value;
		var query = values[0].value;
		SC.get('/tracks',
				{ q: query },
				function(tracks, error) {
					if (error) {
						console.log(error);
						return;
					} else {
						track_array = tracks;
						$('#resultsm').html("");
						var html_string = '';
						if (tracks.length == 0) {
							$('#resultsm').html("<b class='white-text'>No results... Try a different search!</b>");
							return
						} else {
							html_string  = html_string + '<table class="highlight white-text centered"><thead><tr><th>Song Name</th><th>Add to Playlist</th></tr></thead><tbody>';
							tracks.forEach(function(track, index, array){
								html_string = html_string+'<tr><td><a target="_blank" href='+track.permalink_url+' class="white-text">'+track.title+'</a></td><td>'+ '<img id="madd'+index+'" src="img/add.png" height="30" width="30" class="center">' + '</td></tr>';
								// Image From: https://cdn0.iconfinder.com/data/icons/social-messaging-ui-color-shapes/128/add-circle-green-128.png
								// $('#resultsm').append(track.title);
								// $('#resultsm').append("<br>");
								// $('#resultsm').append("<span id = song" + index + ">" + "Add Song to Playlist" + "</span>")
								// $('#resultsm').append("<br></br>");
								// $('#song'+index).css("color", "blue");
								
							});
							html_string = html_string + '</tbody></table>';
							$('#resultsm').html(html_string);
							var roomname = "main_room";
							tracks.forEach(function(track, index, array){
								$("#madd"+index).bind( "click", function() {
									var songInfo = {"songName": track.title, "songURL": track.permalink_url};
									$.ajax({
										url: 'room/' + roomname,
										type: 'POST',
										data: {"songInfo": songInfo},
										success: function(result) {
											console.log("added: " + track.permalink_url);
											$.ajax({
												url: 'room/' + roomname + '/static/reorder',
												type: 'POST',
												success: function(result) {
													if (result == "no more songs"){
														return
													}
													socket.emit("reload_all_playlists");
												}
											});
										}
									});
								});
							});
						}
					}
				}
		);
		event.preventDefault();
	});
});