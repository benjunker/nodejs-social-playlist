SC.initialize({
    client_id: 'YOUR_CLIENT_ID_HERE'
});
//this initializes soundcloud


$.getJSON("data/init_widget.json", function(responseObject, diditwork) {
                        // console.log(diditwork);
                        //hopefully it got our json
                        var track_url = responseObject.widget[0].url;
                        var autoplay = Boolean(responseObject.widget[0].autoplay);
				        SC.oEmbed(track_url, { auto_play: autoplay }, function(oEmbed) {
				            // console.log('oEmbed response: ' + oEmbed);
				            $('#widget').html( oEmbed.html );
				            var iframeElement   = document.querySelector('iframe');
				            var widget         = SC.Widget(iframeElement);
				            // widget.bind(SC.Widget.Events.FINISH, finish);
				        });
				        //here's the widget loading
				        var h1 = responseObject.widget[0].h1;
				        $( "h1" ).html(h1)
				        //here's our title
                } );