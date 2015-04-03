'use strict';

/**
 * @ngdoc overview
 * @name soundPlay
 * @description
 * # soundPlay
 *
 * Main module of the application.
 */
angular
  .module('soundPlay', [
    'ngAnimate',
    'ngMessages',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .when('/play', {
        templateUrl: 'views/play.html',
        controller: 'PlayCtrl'
      })      
      .otherwise({
        redirectTo: '/'
      });
  });



var app = angular.module('soundPlay');


app.value('globals',{
  is_logged_in: false,
  client_id: "22a6f6d4d6138acff711c666f09a62c7",
  current_user: "",
  current_music_id: "",
  current_music_sound: "",
  is_being_played: false,
  WIDTH : window.innerWidth,
  HEIGHT : window.innerHeight
});


//used as global object
app.factory('g_sound', function(globals){
  var g_sound = {};

  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  g_sound.context = new AudioContext();

  //panner, listener context
  g_sound.panner = g_sound.context.createPanner();
  g_sound.listener = g_sound.context.listener;
  g_sound.listener.setPosition(0, 0, 300);
  //position tracked for panner
  g_sound.xPos;
  g_sound.yPos;
  g_sound.zPos;


  //g_sound.audio = new Audio();
  g_sound.source;
  //g_sound.filter;
  g_sound.url;
  g_sound.mySoundBuffer = null;
  g_sound.pausedAt;
  g_sound.isPaused = false;
  /*
  var score = {}; //object declaration

  score.attractions = 0;
  score.entertainment = 0;
  score.location = 0;
  score.history = 0;
  score.sports = 0;

  score.getTotalScore = function(){
    return score.attractions + score.entertainment + score.location + score.history + score.sports;
  }

  score.setToZero = function(category){
    switch(category){
      case "attractions":   
        score.attractions = 0;     
      break;
      case "entertainment":
        score.entertainment = 0;
      break;
      case "location":
        score.location = 0;
      break;
      case "history":
        score.history = 0;
      break;
      case "sports":
        score.sports = 0;
      break;
      default: 
    }
  }
*/

  return g_sound;
});




app.factory('mydb', function(){
  var mydb = {};
  mydb.db = null;
  mydb.ready = false;

  window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
  window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

  var request = indexedDB.open("soundplaydb", 6);
  request.onerror = function(e) {
    console.log(e);
  };  
  request.onupgradeneeded = function (e) {
    console.log('database upgraded');
    var db2 = e.target.result;
    console.log(db2);
    // Create an objectStore for this database
    var objectStore = db2.createObjectStore('data', {keyPath:'keyPath'});
  };
  request.onsuccess = function(event) {
    console.log('database open');
    mydb.db = event.target.result;
    mydb.ready = true;
  };

  mydb.insert = function(music_id, channel_data_arr, num_channel, buff_length, sample_rate, filter_type, playback_rate, spatial_x){
    if (!mydb.ready) {
      console.log('DB is not ready');
      return;
    }
    alert("opening transaction");
    var transaction = mydb.db.transaction('data', 'readwrite');
    alert("opening objectstore");
    var objectStore = transaction.objectStore('data');
    alert("creating object");
    var object = {
      keyPath:music_id, 
      channel_data_arr: channel_data_arr,
      num_channel: num_channel,
      buff_length: buff_length,
      sample_rate: sample_rate,
      filter_type:filter_type, 
      playback_rate: playback_rate, 
      spatial_x: spatial_x
    };    

    object = {
      keyPath:"dummy", 
      channel_data_arr: channel_data_arr,
      num_channel: num_channel,
      buff_length: buff_length,
      sample_rate: sample_rate,
      filter_type:filter_type, 
      playback_rate: playback_rate, 
      spatial_x: spatial_x
    }; 


    console.log('inserting the object......');

    alert("try to store the object data into db");
    var request = objectStore.put(object);
    request.onsuccess = function(e) {
      //console.log(e);
      alert("inserted/updated successfully");
      console.log("inserted/updated successfully");
    };    
    request.onerror = function(e){
      //console.log(e);
      alert("insert error occurred! oh no!: "+e);
      console.log("insert error occurred! oh no!");
    };    
  };
/*
  mydb.insert2 = function(music_id, buffer){
    if (!mydb.ready) {
      console.log('DB is not ready');
      return;
    }

    var transaction = mydb.db.transaction('data', 'readwrite');
    var objectStore = transaction.objectStore('data');
    var object = {keyPath:music_id+"_b", buffer: buffer};    

    console.log('inserting', object);

    var request = objectStore.put(object);
    request.onsuccess = function(e) {
      //console.log(e);
      console.log("inserted/updated successfully");
    };    
    request.onerror = function(e){
      //console.log(e);
      console.log("insert error occurred! oh no!");
    };    
  };

  mydb.insert3 = function(music_id, buffer){
    if (!mydb.ready) {
      console.log('DB is not ready');
      return;
    }

    var transaction = mydb.db.transaction('data', 'readwrite');
    var objectStore = transaction.objectStore('data');
    var object = {keyPath:music_id+"_c", buffer: buffer};    

    console.log('inserting', object);

    var request = objectStore.put(object);
    request.onsuccess = function(e) {
      //console.log(e);
      console.log("inserted/updated successfully");
    };    
    request.onerror = function(e){
      //console.log(e);
      console.log("insert error occurred! oh no!");
    };    
  };
*/
  mydb.fetch = function(music_id){
    if (!mydb.ready) {
      console.log('DB is not ready');
      return;
    }

    var transaction = mydb.db.transaction('data', 'readwrite');
    var objectStore = transaction.objectStore('data');
    var request = objectStore.get(music_id);

    request.onsuccess = function(e) {
      //console.log(e);
      console.log(JSON.stringify(e.target.result));
      //console.log(JSON.stringify(e.target.result.keyPath));
      //return e.target.result;
    };
  };

  mydb.remove = function(music_id){
    if (!mydb.ready) {
      console.log('DB is not ready');
      return;
    }
    var transaction = mydb.db.transaction('data', 'readwrite');
    var objectStore = transaction.objectStore('data');
    var request = objectStore.delete(music_id);    

    request.onsuccess = function(e) {
      //console.log(e);
      console.log("setting data deleted");
      alert("setting data deleted");
    };    
  };



  return mydb;
});