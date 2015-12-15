$.ajax({
	    url: 'room/' + "main_room",
	    type: 'GET',
	    success: function(result) {
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
