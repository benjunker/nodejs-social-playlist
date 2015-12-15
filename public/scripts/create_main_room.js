$.ajax({
	url: 'room/' + "main_room",
	type: 'PUT',
	success: function(result) {
		// console.log(result);
	}
});
//This function is loaded on every page, so there is never 'no room' to add songs to
//Additionally, in my implementation of createRoom, PUT never wholly replaces a resource
//    so this is a resonable operation to run often