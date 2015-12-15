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
		    	//Using $('#playlist').append(element) would sometimes cause the element to close
		    	//(ie - </element>) before I wanted to. String concatanation seemd like a more
		    	//flexible alternative.
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
