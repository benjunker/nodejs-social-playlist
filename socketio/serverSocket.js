exports.init = function(io) {
	var currentPlayers = 0; // keep track of the number of players
	var host_exists = false;

  // When a new connection is initiated
	io.sockets.on('connection', function (socket) {
		++currentPlayers;
		// Send ("emit") a 'players' event back to the socket that just connected.
		// socket.emit('players', { number: currentPlayers});

		socket.emit('init_username', {'username': 'User' + currentPlayers});

		socket.on('reload_all_playlists', function(){
			socket.emit('reorder');
			socket.broadcast.emit('reorder');
		});

		socket.on('save_role', function(data){
			socket.role = data.role;
			if (data.role == "host") {
				socket.broadcast.emit('kick_other_hosts');
			}
		});

		socket.on('update_session_vote_history', function(data) {
			console.log("update");
			console.log(data);
			socket.emit('do_session_update', data);
			socket.broadcast.emit('do_session_update', data);
		});

		socket.on('change_role_to_room', function() {
			socket.role = 'room';
			socket.emit('redirect_host_buffer');
		});
		/*
		 * Emit players events also to all (i.e. broadcast) other connected sockets.
		 * Broadcast is not emitted back to the current (i.e. "this") connection
     */
		// socket.broadcast.emit('players', { number: currentPlayers});
		
		/*
		 * Upon this connection disconnecting (sending a disconnect event)
		 * decrement the number of players and emit an event to all other
		 * sockets.  Notice it would be nonsensical to emit the event back to the
		 * disconnected socket.
		 */
		socket.on('disconnect', function () {
			if (socket.role == "host"){
				socket.broadcast.emit('redirect_home');
			}
			--currentPlayers;
			
		});
	});
}
