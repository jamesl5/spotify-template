var data;
var baseUrl = 'https://api.spotify.com/v1/search?type=track&query='
var player = angular.module('player', [])



// Create application with dependency 'firebase'
var myApp = angular.module('myApp', ['firebase'])

// Bind controller, passing in $scope, $firebaseAuth, $firebaseArray, $firebaseObject
myApp.controller('myCtrl', function($scope, $firebaseAuth, $firebaseArray, $firebaseObject, $http) {
    
	$scope.audioObject = {}
	//get data from spotify
	$scope.getSongs = function() {
		$http.get(baseUrl + $scope.track).success(function(response){
			data = $scope.tracks = response.tracks.items
		  
		})
	}
	
	//play or stop the song
	$scope.play = function(song) {
		if($scope.currentSong == song && $scope.audioObject.pause != undefined) {
			$scope.audioObject.pause()
			$scope.currentSong = false
			return
		} else {
			if($scope.audioObject.pause != undefined){ $scope.audioObject.pause()}
			console.log("play")
			$scope.audioObject = new Audio(song);
			$scope.audioObject.play()  
			$scope.currentSong = song
		}
	}

    // Create a variable 'ref' to reference your firebase storage
    var ref = new Firebase("https://crackling-torch-860.firebaseio.com/");
    var userRef = ref.child("users");

    // Create a firebaseObject of your users, and store this as part of $scope
    $scope.users = $firebaseObject(userRef);

	
    // Create authorization object that referes to firebase
    $scope.authObj = $firebaseAuth(ref);

    // Test if already logged in
    var authData = $scope.authObj.$getAuth();
    if (authData) {
        $scope.userId = authData.uid;
    } 
	
    // SignUp function
	$scope.playlist = [];
    $scope.signUp = function() {
        // Create user
        $scope.authObj.$createUser({
			name: $scope.name,
            email: $scope.email,
            password: $scope.password,
			list: $scope.playlist
        })

        // Once the user is created, call the logIn function
        .then($scope.logIn)

        // Once logged in, set and save the user data
        .then(function(authData) {
            $scope.userId = authData.uid;
            $scope.users[authData.uid] ={
                name:$scope.name,
				list:$scope.playlist
            }
            $scope.users.$save()
        })
        // Catch any errors
        .catch(function(error) {
            console.error("Error: ", error);
			if(error.code = "EMAIL_TAKEN"){
				alert("email already in use")
			}
        });
    }


    // SignIn function, reads playlist
    $scope.signIn = function() {
        $scope.logIn().then(function(authData){
            $scope.userId = authData.uid
			var id = $scope.userId;
			$scope.playlist = $scope.users[id].list
        })
    }
    // LogIn function
    $scope.logIn = function() {
        return $scope.authObj.$authWithPassword({
            email: $scope.email,
            password: $scope.password
        })
    }

    // LogOut function, delete playlist
    $scope.logOut = function() {
        $scope.authObj.$unauth()
        $scope.userId = false
		$scope.playlist = []
    }

	//add song to playlist, alert if there's the same track in the playlist
	$scope.addSong = function(song) {
		if($.inArray(song, $scope.playlist) != -1){
			alert("track is already in the playlist")
		} else{
			$scope.playlist.push(song);
		}
	}

	//remove song from the playlist
	$scope.remove = function(song) {
		var i = $scope.playlist.indexOf(song);
		$scope.playlist.splice(i, 1);
	}
	
	//Save playlist to the account logged in
	$scope.savePlaylist = function(authData) {
		var id = $scope.userId;
		console.log(id);
		$scope.users[id].list = $scope.playlist
		$scope.users.$save()
    }
})

// Add tool tips to anything with a title property
$('body').tooltip({
    selector: '[title]'
});