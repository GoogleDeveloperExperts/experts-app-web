// *****************************************************************************************************
//    								Google Maps Controller
// *****************************************************************************************************
GdeTrackingApp.controller("startCtrl",							function($rootScope, $scope,	$http,	mapOptions,	mapCenters,	mapMarkers)
{
	var loadingToast	= document.querySelector('paper-toast[id="loading"]');	// Show loading sign
	//loadingToast.show();

	$('.angular-google-map-container').css('border-bottom-left-radius',	'0.5em');
	$('.angular-google-map-container').css('border-bottom-right-radius',	'0.5em');

	//Set width with percentage and use polymer attributes to that the map is responsive
	$('.angular-google-map-container').css('height',	'80%');
	$('.angular-google-map-container').attr('layout',true);
	$('.angular-google-map-container').attr('vertical',true);
	$('.angular-google-map-container').attr('fit',true);

	$scope.map			= mapOptions;
	$scope.focusMap		= function (zone)
	{
		mapOptions	= mapCenters[zone];
		$scope.map	= mapOptions;
	};
	$scope.markers		= mapMarkers;
	$scope.gdeList		= [];
	$scope.gdeNumber	= '...';

	$scope.gdeTrackingAPI = null;

  var getPGs = function(gdeObject){
    var gdeProducts = gdeObject.product_group;
    var toRet = [];
    //Obtain the Product Group object for each user PG
    if (gdeProducts){
      gdeProducts.forEach(function(pg){
        $rootScope.productGroups.some(function(apiPG){
          if(pg==apiPG.id){
            //Pg found, add the image name to the current array
            toRet.push(apiPG);
            return true;
          }
          return false;
        })
      });
    }else{
      console.log("GDE "+gdeObject.display_name+ " has no Product Group" + ' ' + new Date().toUTCString());
    }

    if(toRet.length==0){
      toRet.push({id:'',description:'',image:''});
    }
    return toRet;
  }

	$scope.getGdeList			= function ()
	{

		$scope.gdeList = $rootScope.gdeList;

		$scope.gdeNumber	= $scope.gdeList.length;

		$scope.gdeList.forEach(function(currGde){

      //Update the pic size to a bigger image
      currGde.pic_url = currGde.pic_url.replace("=50", "=100");

      //Generate the PG object list for the GDE
      if (!currGde.pgObjects){
        currGde.pgObjects = getPGs(currGde);
      }

      //Create the mapMarker only if we have the geocode
      if (currGde.geocode){
        //Create the mapMarker for the current GDE
        mapMarker= {};
        
        mapMarker["latitude"] = currGde.geocode.lat;
        mapMarker["longitude"] = currGde.geocode.lng;
        var badge = currGde.pgObjects[0].image; //Get the first PGs Image
        mapMarker["icon"] = 'img/badges/'+badge.replace('.svg','.png');
        mapMarker["id"] = "gde" + currGde.gplus_id;
        mapMarker["name"] = currGde.display_name;
        mapMarker["pic"] = currGde.pic_url;
        mapMarker["pgObjects"] = currGde.pgObjects;
        mapMarker["country"] = currGde.country;
        mapMarker["ctry_filename"] = currGde.ctry_filename;
        
        mapMarkers.push(mapMarker);
      }
		});

		$scope.markers = mapMarkers;

		$scope.markerClick	= function(id)
		{
			var gdeId	= '#'+id;
			$('window').attr("show",true);
			console.log(gdeId);
		};

		//	Trigger CSS3 animation after map loads
		$('.nav-fab')	.css('-webkit-animation'	, 'fabAppears	2s	linear	1	both');	//	-webkit- CSS
		$('.nav-fab')	.css('animation'			    , 'fabAppears	2s	linear	1	both');	//	W3C	CSS
		$('.mapArea')	.css('-webkit-animation'	, 'mapAppears	2s	linear	1	both');	//	-webkit- CSS
		$('.mapArea')	.css('animation'			    , 'mapAppears	2s	linear	1	both');	//	W3C	CSS
		$scope.$apply();

	};

	$scope.$on('event:metadata-ready', function (event, gdeTrackingAPI)
	{
		console.log('startCtrl: metadata-ready received' + ' ' + new Date().toUTCString());

		//Save the API object in the scope
		$scope.gdeTrackingAPI = gdeTrackingAPI;
		//run the function to display the GDEs on the map
		$scope.getGdeList();
	});

	if ($rootScope.metadataReady){
    $scope.gdeTrackingAPI = gapi.client.gdetracking;
    //run the function to display the GDEs on the map
		$scope.getGdeList();
  }

});
