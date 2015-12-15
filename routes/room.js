// include my model for this application
var roomModel = require("../models/roomModel.js")

// Define the routes for this controller
exports.init = function(app) {
  // app.get('/', index); // essentially the app welcome page
  // The collection parameter maps directly to the mongoDB collection
  // app.put('/:collection', doCreate); // CRUD Create
  // app.get('/:collection', doRetrieve); // CRUD Retrieve
  // app.post('/:collection', doUpdate); // CRUD Update
  // app.delete('/:collection', doDelete);
  app.put('/room/:roomname', doCreateRoom);
  app.get('/room/:roomname', doRetrieveRoom);
  app.delete('/room/:roomname', doDeleteRoom);
  app.post('/room/:roomname', doAddSong);
  app.post('/room/:roomname/static/next', doNextSong);
  app.post('/room/:roomname/upvote', doUpvoteSong);
  app.post('/room/:roomname/downvote', doDownvoteSong);
  app.post('/room/:roomname/static/reorder', doReorderSong);
  app.post('/room/:roomname/session', doSessionUpdate);
  app.post('/room/:roomname/session/zero', doZeroSession);
}

// No path:  display instructions for use
// index = function(req, res) {
//   res.render('help', {title: 'MongoDB Test'})
// };

/********** CRUD Create *******************************************************
 * Take the object defined in the request body and do the Create
 * operation in mongoModel.  (Note: The mongoModel method was called "insert"
 * when we discussed this in class but I changed it to "create" to be
 * consistent with CRUD operations.)
 */ 
doCreate = function(req, res){
  /*
   * A series of console.log messages are produced in order to demonstrate
   * the order in which the code is executed.  Given that asynchronous 
   * operations are involved, the order will *not* be sequential as implied
   * by the preceding numbers.  These numbers are only shorthand to quickly
   * identify the individual messages.
   */
  console.log("1. Starting doCreate in dbRoutes");
  /*
   * First check if req.body has something to create.
   * Object.keys(req.body).length is a quick way to count the number of
   * properties in the req.body object.
   */
  if (Object.keys(req.body).length == 0) {
    res.render('text', {obj: "No create message body found"});
    return;
  }
  /*
   * Call the model Create with:
   *  - The collection to do the Create into
   *  - The object to add to the model, received as the body of the request
   *  - An anonymous callback function to be called by the model once the
   *    create has been successful.  The insertion of the object into the 
   *    database is asynchronous, so the model will not be able to "return"
   *    (as in a function return) confirmation that the create was successful.
   *    Consequently, so that this controller can be alerted with the create
   *    is successful, a callback function is provided for the model to 
   *    call in the future whenever the create has completed.
   */
  roomModel.create ( req.params.collection, 
                      req.body,
                      function(result) {
                        // result equal to true means create was successful
                        var success = (result ? "Create successful" : "Create unsuccessful");
                        res.render('text', {obj: success});
                        console.log("2. Done with callback in dbRoutes create");
                      });
  console.log("3. Done with doCreate in dbRoutes");
}

/********** CRUD Retrieve (or Read) *******************************************
 * Take the object defined in the query string and do the Retrieve
 * operation in mongoModel.  (Note: The mongoModel method was called "find"
 * when we discussed this in class but I changed it to "retrieve" to be
 * consistent with CRUD operations.)
 */ 

doRetrieve = function(req, res){
  /*
   * Call the model Retrieve with:
   *  - The collection to Retrieve from
   *  - The object to lookup in the model, from the request query string
   *  - As discussed above, an anonymous callback function to be called by the
   *    model once the retrieve has been successful.
   * modelData is an array of objects returned as a result of the Retrieve
   */
  roomModel.retrieve(
    req.params.collection, 
    req.query,
    function(modelData) {
      if (modelData.length) {
        res.render('results',{title: 'Mongo Demo', obj: modelData});
      } else {
        var message = "No documents with "+JSON.stringify(req.query)+ 
                      " in collection "+req.params.collection+" found.";
        res.render('text', {obj: message});
      }
    });
}

/********** CRUD Update *******************************************************
 * Take the MongoDB update object defined in the request body and do the
 * update.  (I understand this is bad form for it assumes that the client
 * has knowledge of the structure of the database behind the model.  I did
 * this to keep the example very general for any collection of any documents.
 * You should not do this in your project for you know exactly what collection
 * you are using and the content of the documents you are storing to them.)
 */ 
doUpdate = function(req, res){
  // if there is no filter to select documents to update, select all documents
  var filter = req.body.find ? JSON.parse(req.body.find) : {};
  // if there no update operation defined, render an error page.
  if (!req.body.update) {
    res.render('text', {obj: "No update operation defined"});
    return;
  }
  var update = JSON.parse(req.body.update);
  /*
   * Call the model Update with:
   *  - The collection to update
   *  - The filter to select what documents to update
   *  - The update operation
   *    E.g. the request body string:
   *      find={"name":"pear"}&update={"$set":{"leaves":"green"}}
   *      becomes filter={"name":"pear"}
   *      and update={"$set":{"leaves":"green"}}
   *  - As discussed above, an anonymous callback function to be called by the
   *    model once the update has been successful.
   */
  roomModel.update(  req.params.collection, filter, update,
                      function(status) {
                        res.render('text',{obj: status});
                      });
}

/********** CRUD Delete *******************************************************
 * The delete route handler is left as an exercise for you to define.
 */
doDelete = function(req, res){

  roomModel.delete(
    req.params.collection,
    req.query,
    function(result) {
      console.log('*');
      console.log(result);
      console.log('*');
      // result equal to true means create was successful
      var success = (result != "Deleted 0" ? "Delete successful" : "Delete unsuccessful");
      res.render('text', {obj: success});
    }
  );
}

// newRoom: function(roomname, callback)
// getRoom: function(roomname, callback)
// deleteRoom: function(roomname, callback)
// nextSong: function(roomname, callback)
// addSong: function(roomname, songInfo, callback)
// upvote: function(roomname, songname, callback)
// downvote: function(roomname, songname, callback)
// reorderSongs: function(roomname, callback)

doCreateRoom = function(req, res){
  roomModel.newRoom(req.params.roomname,function(result) {
                        // result equal to true means create was successful
                        var success;
                        if (result === true) {
                          success = "Create successful";
                        } else if (result === "room already exists") {
                          success = result;
                        } else {
                          success = "Create unsuccessful";
                        }
                        res.render('text', {obj: success});
                      });
}

doRetrieveRoom = function(req, res){
  roomModel.getRoom(req.params.roomname, function(modelData) {
      if (modelData.length) {
        res.render('text', {obj: JSON.stringify(modelData[0])});
      } else {
        var message = "No documents with "+JSON.stringify(req.query)+ 
                      " in collection "+req.params.collection+" found.";
        res.render('text', {obj: message});
      }
    });
}

doDeleteRoom = function(req, res){
  roomModel.deleteRoom(req.params.roomname, function(result) {
      // console.log('*');
      // console.log(result);
      // console.log('*');
      // result equal to true means create was successful
      var success = (result != "Deleted 0" ? "Delete successful" : "Delete unsuccessful");
      res.render('text', {obj: success});
    });
}

doAddSong = function(req, res){
  roomModel.addSong(req.params.roomname, req.body.songInfo, function(status) {
                        res.render('text',{obj: status});
                      });
}

doNextSong = function(req, res){
  roomModel.nextSong(req.params.roomname, function(status) {
                        res.render('text',{obj: status});
                      });
}

doUpvoteSong = function(req, res){
  var added_already = false;
  var can_vote = true;
  if (!("voted_for" in req.session)) {
    var a = [];
    req.session.voted_for = a;
    req.session.voted_for.push(req.body.song_url);
    added_already = true;
  } else {
    req.session.voted_for.forEach(function(url,index,array) {
      if (req.body.song_url == url) {
        can_vote = false;
      }
    });
  }
  if (can_vote) {
    if (!added_already) {
      req.session.voted_for.push(req.body.song_url);
    }
    roomModel.upvote(req.params.roomname, req.body.song_url, function(status) {
                          res.render('text',{obj: status});
                        });
  } else {
    console.log("already voted for that song");
    res.render('text', {obj: "already voted for that song"});
  }
  console.log(req.session.voted_for)
}

doDownvoteSong = function(req, res){
  var can_vote = true;
  var added_already = false;
  if (!("voted_for" in req.session)) {
    var a = [];
    req.session.voted_for = a;
    req.session.voted_for.push(req.body.song_url);
    added_already = true;
  } else {
    req.session.voted_for.forEach(function(url,index,array) {
      if (req.body.song_url == url) {
        can_vote = false;
      }
    });
  }
  if (can_vote) {
    if (!added_already) {
      req.session.voted_for.push(req.body.song_url);
    }
    roomModel.downvote(req.params.roomname, req.body.song_url, function(status) {
                          res.render('text',{obj: status});
                        });
  } else {
    console.log("already voted for that song");
    res.render('text', {obj: "already voted for that song"});
  }
  console.log(req.session.voted_for)
}

doReorderSong = function(req, res){
  roomModel.reorderSongs(req.params.roomname, function(status) {
                        res.render('text',{ obj: status});
                      });
}

doSessionUpdate = function(req, res){
  if ("voted_for" in req.session) {
    if (req.session.voted_for.indexOf(req.body.song_url) > -1) {
      req.session.voted_for.splice(req.session.voted_for.indexOf(req.body.song_url), 1);
    }
  }
  res.render('text', {obj: req.body.song_url});
}

doZeroSession = function(req, res){
  req.session.voted_for = [];
  res.render('text', {obj: "zeroed"});
}


/*
 * How to test:
 *  - Create a test web page
 *  - Use REST Console for Chrome
 *    (If you use this option, be sure to set the Body Content Headers Content-Type to:
 *    application/x-www-form-urlencoded . Else body-parser won't work correctly.)
 *  - Use CURL (see tests below)
 *    curl comes standard on linux and MacOS.  For windows, download it from:
 *    http://curl.haxx.se/download.html
 *
 * Tests via CURL for Create and Update (Retrieve can be done from browser)

# >>>>>>>>>> test CREATE success by adding 3 fruits
curl -i -X PUT -d "name=apricot&price=2" http://localhost:50000/fruit
curl -i -X PUT -d "name=banana&price=3" http://localhost:50000/fruit
curl -i -X PUT -d "name=cantaloupe&price=4" http://localhost:50000/fruit
# >>>>>>>>>> test CREATE missing what to put
curl -i -X PUT  http://localhost:50000/fruit
# >>>>>>>>>> test UPDATE success - modify
curl -i -X POST -d 'find={"name":"banana"}&update={"$set":{"color":"yellow"}}' http://localhost:50000/fruit
# >>>>>>>>>> test UPDATE success - insert
curl -i -X POST -d 'find={"name":"plum"}&update={"$set":{"color":"purple"}}' http://localhost:50000/fruit
# >>>>>>>>>> test UPDATE missing filter, so apply to all
curl -i -X POST -d 'update={"$set":{"edible":"true"}}' http://localhost:50000/fruit
# >>>>>>>>>> test UPDATE missing update operation
curl -i -X POST -d 'find={"name":"pear"}' http://localhost:50000/fruit

 */