var role = 'host';
var roomname;
var counter = 0;
var bound_already = false;

if (window.location.href.indexOf("rhcloud") > -1){
	var socket = io.connect("http://nodejs-bjunker.rhcloud.com:8000");
} else {
	var socket = io.connect();
}
//^ detect whether on openshift or not

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
			// console.log("4: " + result);
			result = result.replace(/&#34;/g,'"');
	    	result = JSON.parse(result);
	    	// console.log(result);
	    	var html_string = '';
	    	if (result.songs.length == 0) {
	    		$('#playlist').html("Nothing... Add more songs!");
	    	} else {
		    	html_string  = html_string + '<table class="highlight white-text"><thead><tr><th>Song Name</th><th>Votes</th></tr></thead><tbody>';
		    	result.songs.forEach(function(songobj, index, array){
		    		html_string = html_string+'<tr><td><a target="_blank" href='+songobj.songInfo.songURL+' class="white-text">'+songobj.songInfo.songName+'</a></td><td>'+songobj.votes+'</td></tr>';
		    	});
		    	html_string = html_string + '</tbody></table>';
		    	$('#playlist').html(html_string);
		    }
		}
	});
});

socket.on('init_username', function(data){
	$('#username').html(data.username);
});

socket.on('do_session_update', function(data) {
	console.log("got here")
	$.ajax({
		url: 'room/main_room/session',
		type: 'POST',
		data: data,
		success: function(result) {
			console.log(result);
		}
	});
});

socket.on('kick_other_hosts', function() {
	socket.emit('change_role_to_room')
});

socket.on('redirect_host_buffer', function() {
	window.location.replace("hostBuffer.html");
});
//^ socket.io stuff




$(function (){
	$("#doStartPlaylist").submit(function(event){
		$('#doStartPlaylist').toggleClass("hide");
		// var values = $("#doStartPlaylist input").serializeArray();
		// roomname = values[0].value;
		roomname = 'main_room';
		$.ajax({
			    url: 'room/' + roomname + '/static/reorder',
			    type: 'POST',
			    success: function(result) {
			    	console.log("2: " + result);
			    	finish();
			    // 	$.ajax({
				   //  	url: 'room/' + roomname + '/static/next',
				   //  	type: 'POST',
				   //  	success: function(result) {
				   //  		console.log("3: " + result);
				   //  		$("#response").html(result);
				   //  		var iframeElement   = document.querySelector('iframe');
							// var widget         = SC.Widget(iframeElement);
							// widget.load(result, { auto_play: true});
							// widget.bind(SC.Widget.Events.FINISH, finish);
							// $.ajax({
							//     url: 'room/' + "main_room",
							//     type: 'GET',
							//     success: function(result) {
							//     	console.log("4: " + result);
							//         $("#playlist").html(result);
							//     }
							// });
				   //    	}
				   //  });
			      }
			    });
		event.preventDefault();
	});
});

finish = function(){
	// console.log('*');
	// console.log(counter);
	// console.log('*');
	counter++;
	//nested in-callback AJAX calls seemed like the best way to implement a structured order to fn calls
	$.ajax({
		url: 'room/' + roomname + '/static/next',
		type: 'POST',
		success: function(result) {
			console.log("3: " + result);
			// $("#response").html(result);
			if (result == "no more songs"){
				$('#doStartPlaylist').toggleClass("hide");
				return
			}
			socket.emit('update_session_vote_history', {'song_url': result});
    		var iframeElement   = document.querySelector('iframe');
			var widget         = SC.Widget(iframeElement);
			widget.load(result, { auto_play: true });
			if (bound_already == false) {
				widget.bind(SC.Widget.Events.FINISH, finish);
				//This causes the next song to start when the last song is finished
				bound_already = true;
			}
			$.ajax({
			    url: 'room/' + "main_room",
			    type: 'GET',
			    success: function(result) {
			    	console.log("4: " + result);
			        // $("#playlist").html(result);
			        socket.emit('reload_all_playlists');
			    }
			});
		}
	});
}