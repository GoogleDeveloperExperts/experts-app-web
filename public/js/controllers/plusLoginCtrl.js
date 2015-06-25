// *****************************************************************************************************
//    								plusLoginCtrl Controller
//					Library source: http://jeradbitner.com/angular-directive.g-signin/
// *****************************************************************************************************
GdeTrackingApp.controller('plusLoginCtrl',						function($scope,	$location,	$http,	$rootScope)
{
	$location.path('/');		// Forces the App to always load in the Welcome Screen
	$scope.gdeTrackingAPI = null;

	$scope.getUserAccount = function(userId){
	  if ($rootScope.metadataReady){
	    //Search the current user
	    var currUser = null;
	    $rootScope.gdeList.some(function(item){
	      if(item.gplus_id==userId){
	        currUser=item;
	        return true;
	      }
	      return false;
	    });

	    console.log('Welcome '+$scope.userName+'.' + ' ' + new Date().toUTCString());
	    if (currUser){
        $rootScope.userName = currUser.display_name;
        $('#generalStatisticsForGooglers').css('display','none');	//Hide the previously shown menu
        //Show the right menu by user type
        switch (currUser.type){
          case 'administrator':
            console.log('You are an administrator of this app!');
            $('#generalStatisticsForGooglers')	.css('display','flex');
            break;
          case 'manager':
            console.log('You are a manager of this app!');
            $('#generalStatisticsForGooglers')	.css('display','flex');
            break;
          case 'active':
            console.log('You are a GDE!');
            $('#gdeStatistics')					.css('display','flex');
            $('#gdeAvatarBuilder')				.css('display','flex');
            break;
          default:
            break;	//disabled users
        }
        
        $rootScope.userLoaded = true;
	    }else{
	      console.log('User not found in the account masterlist' + ' ' + new Date().toUTCString());
	    }
	  }
	};
	
	$scope.pushUserAccount = function(userObject){
	  $scope.gdeTrackingAPI.account.insert(userObject).execute(
        function(response)
        {
          if (response.code){
            console.log('gdeTrackingAPI.account.insert(DATA) responded with Response Code: '+response.code + ' - '+ response.message);
            console.log(JSON.stringify(userObject));
            alert(response.message);
          }else{
            console.log('Email Updated correctly');
          }
    		}
    	);
	};

	$scope.$on('event:google-plus-signin-success', function (event, authResult)
	{	// User successfully authorized the G+ App!
    //console.log(event);
		$('.signinButton')	.css('display','none');
		$('.signout')		.css('display','block');

		gapi.client.load('plus', 'v1', function()
		{
			var request	= gapi.client.plus.people.get(
			{
				'userId': 'me'
			});
			request.execute(function(resp)
			{
        $('gde-badge').get(0).updateImage(resp.image.url.replace(/\?.*$/,""));

				$rootScope.$broadcast('gde:logged',resp.displayName);
				$scope.userName = resp.displayName;
				$scope.userImageUrl = (resp.image.url).replace("=50", "=90");
				$scope.userEmails = resp.emails;
				$rootScope.usrId = resp.id;
				$scope.id = resp.id;
        //console.log('User Id:' + resp.id);
        
			  for (var i=0;i<$scope.userEmails.length;i++)
				{
					var emailDomain = $scope.userEmails[i].value.substring($scope.userEmails[i].value.indexOf('@'));
					if (emailDomain == '@google.com')	//	Detect if domain matches an official Google domain (Googlers only).
					{
						console	.log('You are a Googler!');
						console	.log('Hope you like the detailed GDE program statistics.');
						$('#generalStatisticsForGooglers')	.css('display','flex');
						$rootScope.usrId		= resp.id; //User authorized, save the Id in the rootScope
					}
					console.log('Logged userId:' + resp.id + ' ' + new Date().toUTCString());
					console.log('Logged email:' + $scope.userEmails[i].value);
				}

				$('.userName')	.text($scope.userName);	// Binds the user name into the DOM using a class via jQuery so it can be repeated throughout the document.
				var userImage			= document.createElement('img');
				userImage.src			= $scope.userImageUrl;
				userImage.alt			= 'g+ image';
				$('#userImg')	.html(userImage);
				$('#authInfos').show();

				if($rootScope.metadataReady){
				  $scope.getUserAccount(resp.id);
				}

			});
		});
	});
	$scope.$on('event:google-plus-signin-failure', function (event, authResult)
	{																					// User has not authorized the G+ App!
		$('.signinButton')	.css('display','block');

    //$('.signout')		.css('display','none');
    if (authResult.status.google_logged_in)
    {
      alert("There was an Error with Oauth");
      console.log('Error in sign in flow.' + ' ' + new Date().toUTCString());
		};
		$('#userImg')		.html = '';
		$('.userName')		.text= '';
		$rootScope.usrId = null;//UnAuthorize the user

		console.log(authResult);
	});
	$scope.$on('event:metadata-ready', function (event, gdeTrackingAPI)
	{
		console.log('plusLoginCtrl: metadata-ready received' + ' ' + new Date().toUTCString());

		//Save the API object in the scope
		$scope.gdeTrackingAPI = gdeTrackingAPI;

		//Get data from the backend only if the user is already logged in and the user date are not already loaded
		if($rootScope.usrId && !$rootScope.userLoaded){
		  //run the function to get data from the backend
		  $scope.getUserAccount($rootScope.usrId);
		}

	});

	if ($rootScope.metadataReady){
    $scope.gdeTrackingAPI = gapi.client.gdetracking;
    //Get data from the backend only if the user is already logged in and the user date are not already loaded
		if($rootScope.usrId && !$rootScope.userLoaded){
		  //run the function to get data from the backend
		  $scope.getUserAccount($rootScope.usrId);
		}
  }

});
