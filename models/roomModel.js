/*
 * This model uses the Node.js MongoDB Driver.
 * To install:  npm install mongodb --save
 */
var mongoClient = require('mongodb').MongoClient;

/*
 * This connection_string is for mongodb running locally.
 * Change nameOfMyDb to reflect the name you want for your database
 */
var connection_string = 'localhost:27017/test';
/*
 * If OPENSHIFT env variables have values, then this app must be running on 
 * OPENSHIFT.  Therefore use the connection info in the OPENSHIFT environment
 * variables to replace the connection_string.
 */
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
  connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
  process.env.OPENSHIFT_APP_NAME;
}
// Global variable of the connected database
var mongoDB; 

// Use connect method to connect to the MongoDB server
mongoClient.connect('mongodb://'+connection_string, function(err, db) {
  if (err) doError(err);
  console.log("Connected to MongoDB server at: "+connection_string);
  mongoDB = db; // Make reference to db globally available.
});

/*
 * In the methods below, notice the use of a callback argument,
 * how that callback function is called, and the argument it is given.
 * Why do we need to be passed a callback function? Why can't the create, 
 * retrieve, and update functinons just return the data directly?
 * (This is what we discussed in class.)
 */

/********** CRUD Create -> Mongo insert ***************************************
 * @param {string} collection - The collection within the database
 * @param {object} data - The object to insert as a MongoDB document
 * @param {function} callback - Function to call upon insert completion
 *
 * See the API for more information on insert:
 * http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#insertOne
 */
create = function(collection, data, callback) {
  // console.log("4. Start insert function in mongoModel");
  // Do an asynchronous insert into the given collection
  mongoDB.collection(collection).insertOne(
    data,                     // the object to be inserted
    function(err, status) {   // callback upon completion
      if (err) doError(err);
      // console.log("5. Done with mongo insert operation in mongoModel");
      // use the callback function supplied by the controller to pass
      // back true if successful else false
      var success = (status.result.n == 1 ? true : false);
      callback(success);
      // console.log("6. Done with insert operation callback in mongoModel");
    });
  // console.log("7. Done with insert function in mongoModel");
}

/********** CRUD Retrieve -> Mongo find ***************************************
 * @param {string} collection - The collection within the database
 * @param {object} query - The query object to search with
 * @param {function} callback - Function to call upon completion
 *
 * See the API for more information on find:
 * http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#find
 * and toArray:
 * http://mongodb.github.io/node-mongodb-native/2.0/api/Cursor.html#toArray
 */
retrieve = function(collection, query, callback) {
  /*
   * The find sets up the cursor which you can iterate over and each
   * iteration does the actual retrieve. toArray asynchronously retrieves the
   * whole result set and returns an array.
   */
  mongoDB.collection(collection).find(query).toArray(function(err, docs) {
    if (err) doError(err);
    // docs are MongoDB documents, returned as an array of JavaScript objects
    // Use the callback provided by the controller to send back the docs.
    callback(docs);
  });
}

/********** CRUD Update -> Mongo updateMany ***********************************
 * @param {string} collection - The collection within the database
 * @param {object} filter - The MongoDB filter
 * @param {object} update - The update operation to perform
 * @param {function} callback - Function to call upon completion
 *
 * See the API for more information on insert:
 * http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#updateMany
 */
update = function(collection, filter, update, callback, fnCall, song_url) {
  mongoDB
    .collection(collection)     // The collection to update
    .updateMany(                // Use updateOne to only update 1 document
      filter,                   // Filter selects which documents to update
      update,                   // The update operation
      {upsert:false},            // If document not found, insert one with this update
                                // Set upsert false (default) to not do insert
      function(err, status) {   // Callback upon error or success
        if (err) doError(err);
        if (fnCall == "next") {
          callback(song_url);
        } else {
          callback('Modified '+ status.modifiedCount 
                   +' and added '+ status.upsertedCount+" documents");
        }
      });
}

/********** CRUD Delete -> Mongo deleteOne or deleteMany **********************
 * The delete model is left as an exercise for you to define.
 */
destroy = function(collection, filter, callback){
  mongoDB
    .collection(collection)
    .deleteOne(
      filter,
      null,
      function(err, status) {   // Callback upon error or success
        if (err) doError(err);
        callback('Deleted '+ status.deletedCount);
        }
    );
}


var doError = function(e) {
        console.error("ERROR: " + e);
        throw new Error(e);
    }

/*
ABOVE: mongodb ^private methods

BELOW: Pertinent Methods
*/


// newRoom(roomname) → create a new room
// getRoom(roomname) → to get the pertinent room
// deleteRoom(roomname) → delete a room
// nextSong(room) → advance the song to the next song (since it wouldn’t make sense for users to be able to skip songs in a social playlist app, the server will call this method on its own)
// addSong(room, songInfo) → adds a new song to a room’s playlist
// upvote(song, room) → upvotes a song
// downvote(song, room) → downvotes a song
// reorderSongs(room) → reorders the songs in a room in desc order of votes



var Room =  {

  newRoom: function(roomname, callback){
    create_no_duplicate = function(docs){
      if (docs.length === 0){
        create("room", {"name": roomname, "songs": []}, callback);
      } else {
        callback("room already exists");
        return
      }
    };

    retrieve("room", {"name": roomname}, create_no_duplicate)
  },

  getRoom: function(roomname, callback){
    retrieve("room", {"name": roomname}, callback);
  },

  deleteRoom: function(roomname, callback){
    destroy("room", {"name": roomname}, callback);
  },

  nextSong: function(roomname, callback){
    advance = function(docs){
      var room = docs[0];
      if (room == undefined){
        callback("no such room");
        return
      };
      var newSongs = room.songs;
      if (newSongs.length == 0){
        callback("no more songs");
        return
      }
      var song_url = newSongs[0].songInfo.songURL;
      newSongs.shift();
      update("room", {"name": roomname}, { '$set': { songs: newSongs } }, callback, "next", song_url);
    };

    retrieve("room", {"name": roomname}, advance);
  },

  addSong: function(roomname, songInfo, callback){
    add = function(docs){
      var room = docs[0];
      if (room == undefined){
        callback("no such room");
        return
      };
      var newSongs = room.songs;
      var in_playlist = false;
      var song_url;
      newSongs.forEach(function(songobj, index, array){
        song_url = songobj.songInfo.songURL;
        if (songInfo.songURL == song_url) {
          in_playlist = true;
        }
      });
      if (!in_playlist) {
        newSongs.push({"songInfo": songInfo, "votes": 0});
      } else {
        console.log("already in the playlist");
        callback("already in the playlist");
      }
      update("room", {"name": roomname}, { '$set': { songs: newSongs } }, callback);
    };

    retrieve("room", {"name": roomname}, add);
  },

  upvote: function(roomname, songURL, callback){
    up = function(docs){
      var room = docs[0];
      if (room == undefined){
        callback("no such room");
        return
      };
      var newSongs = room.songs;
      var song;
      for (var i =0; i < newSongs.length ; i++){
        song = newSongs[i];
        if (song.songInfo.songURL == songURL){
          song.votes = song.votes + 1;
          newSongs[i] = song;
          break;
        }
      };
      update("room", {"name": roomname}, { '$set': { songs: newSongs } }, callback);
    };

    retrieve("room", {"name": roomname}, up);
  },

  downvote: function(roomname, songURL, callback){
    down = function(docs){
      var room = docs[0];
      if (room == undefined){
        callback("no such room");
        return
      };
      var newSongs = room.songs;
      var song;
      for (var i =0; i < newSongs.length ; i++){
        song = newSongs[i];
        if (song.songInfo.songURL == songURL){
          song.votes = song.votes - 1;
          newSongs[i] = song;
          break;
        }
      };
      update("room", {"name": roomname}, { '$set': { songs: newSongs } }, callback);
    };

    retrieve("room", {"name": roomname}, down);
  },

  reorderSongs: function(roomname, callback){
    sortfn = function (a, b) {
      if (a.votes > b.votes) {
        return -1;
      }
      else if (a.votes < b.votes) {
        return 1;
      }
      // It a>b -> -1 & b>a -> 1 so the sort is in DESC order
      return 0;
    }

    reorder = function(docs){
      var room = docs[0];
      if (room == undefined){
        callback("no such room");
        return
      };
      var newSongs = room.songs;
      newSongs.sort(sortfn);
      update("room", {"name": roomname}, { '$set': { songs: newSongs } }, callback);
    }
    
    retrieve("room", {"name": roomname}, reorder);
  }

};
/*
 * Export the Class
 */

 module.exports = Room;