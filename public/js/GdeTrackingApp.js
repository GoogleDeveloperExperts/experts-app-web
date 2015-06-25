"use strict";

// =====================================================================================================
//											AngularJS
// =====================================================================================================
var GdeTrackingApp	= angular.module('GdeTrackingApp'	, [ 'ngRoute' , 'google-maps' , 'googlePlusSignin' , 'ng-polymer-elements']);

// =====================================================================================================
//								Google JS API & AngularJS load control
// =====================================================================================================
google.setOnLoadCallback(function ()
{
    angular.bootstrap(document.body,['GdeTrackingApp']);

});
google.load(
	'visualization',
	'1',
	{
		packages:
			[
				'controls'
			]
	}
);

function onGapiClientLoad(){
  //Get the RootScope
  var rootScope = angular.element(document.body).scope();
  //var ROOT = 'https://elite-firefly-737.appspot.com/_ah/api';
  var ROOT = 'https://omega-keep-406.appspot.com/_ah/api';
      gapi.client.load('gdetracking', 'v1.0b2', function() {
        rootScope.is_backend_ready=true;
        console.log('GdeApp Backend API LOADED!' + ' ' + new Date().toUTCString());

        //Broadcast that the API is ready
        rootScope.$broadcast('event:gde-app-back-end-ready',gapi.client.gdetracking);
        console.log('event emitted' + ' ' + new Date().toUTCString());
        //Hide the loading div
        document.querySelector("#splash_screen").style.display='none'
      }, ROOT);
}

// =====================================================================================================
//											Polymer
// =====================================================================================================
function toggleDialog(id)
{
	var dialog = document.querySelector('[id=' + id + ']');
	dialog.toggle();
}
document.addEventListener('polymer-ready', function()
{
	var navicon		= document.getElementById('navicon');
	var drawerPanel	= document.getElementById('drawerPanel');
	navicon.addEventListener('click', function()
	{
		drawerPanel.togglePanel();
	});
});


// =====================================================================================================
//											Bagde Creator
// =====================================================================================================

document.querySelector('#avatarForm').addEventListener('submit',function(evt){
	document.querySelector('gde-badge').setAttribute('userid', document.querySelector('#userid').value);
    evt.preventDefault();
});

// *****************************************************************************************************
//  								Dynamic HTML navigation
// *****************************************************************************************************
GdeTrackingApp.config(function($routeProvider)
{
	$routeProvider.
		when('/',
		{
			controller	: 'startCtrl',
			templateUrl	:'html/start.html'
		}).
		when('/myStatistics',
		{
			controller	: 'myStatisticsCtrl',
			templateUrl	:'html/myStatistics.html'
		}).
		when('/generalStatisticsForGooglers',
		{
			controller	: 'generalStatisticsForGooglersCtrl',
			templateUrl	:'html/generalStatisticsForGooglers.html'
		}).
		otherwise({redirectTo:'/'});
});

// *****************************************************************************************************
//   									AngularJS Factories
// *****************************************************************************************************
GdeTrackingApp.factory("mapOptions",	[function()
{
	var mapOptions =
	{
		center:
		{
			latitude	: 27.371767300523047,
			longitude	: -3.8203125000000027
		},
		zoom	: 2,
		icon	: {icon:'../img/favicon.png'}
	};
	return mapOptions;
}]);
GdeTrackingApp.factory("mapCenters",	[function()
{
	var mapCenters =
	{
		'World':
		{
			center:
			{
				latitude	: 27.371767300523047,
				longitude	: -3.8203125000000027
			},
			zoom: 2
		},
		'Asia':
		{
			center:
			{
				latitude	: 28.767659105690974,
				longitude	: 91.453125
			},
			zoom: 3
		},
		'Africa':
		{
			center:
			{
				latitude	: 6.140554782450104,
				longitude	: 23.601562499999996
			},
			zoom: 3
		},
		'Europe':
		{
			center:
			{
				latitude	: 58.35563036280954,
				longitude	: 19.910156249999996
			},
			zoom: 3
		},
		'North America':
		{
			center:
			{
				latitude	: 49.610709938074166,
				longitude	: -100.67578125
			},
			zoom: 3
		},
		'South America':
		{
			center:
			{
				latitude	: -21.616579336740593,
				longitude	: -60.0703125
			},
			zoom: 3
		},
		'Oceania':
		{
			center:
			{
				latitude	: -23.725011735951973,
				longitude	: 129.59765625
			},
			zoom: 4
		}
	};
	return mapCenters;
}]);
GdeTrackingApp.factory("mapMarkers",	[function()
{
	var mapMarkers	= [];

	return mapMarkers;
}]);
GdeTrackingApp.factory("years",			[function()
{
	var years		= [];
	years			.push({"value":"2013"});
	years			.push({"value":"2014"});
	years			.push({"value":"2015"});

	return years;
}]);
GdeTrackingApp.factory("months",		[function()
{
	var months		= [];
	months			.push({"value":"January"});
	months			.push({"value":"February"});
	months			.push({"value":"March"});
	months			.push({"value":"April"});
	months			.push({"value":"May"});
	months			.push({"value":"June"});
	months			.push({"value":"July"});
	months			.push({"value":"August"});
	months			.push({"value":"September"});
	months			.push({"value":"October"});
	months			.push({"value":"November"});
	months			.push({"value":"December"});

	return months;
}]);

// *****************************************************************************************************
//						Utility functions for accumulating and displaying stats
// *****************************************************************************************************
function log10(val) {
  if (val==0)
    return 0;
  return Math.log(val) / Math.LN10;
}
GdeTrackingApp.run(function ($rootScope)
{
  $rootScope.is_backend_ready=false;

  $rootScope.utils =
  {
    'activityFromApi'			: function(apiData)
    {
      var activity = {};
      activity.gde_name		= apiData.gde_name;
      activity.title			= apiData.activity_title;
      activity.url			= apiData.activity_link;
      activity.gplus_id		= apiData.gplus_id;
      activity.resharers		= parseInt(apiData.resharers	|| 0, 10);
      activity.comments		= parseInt(apiData.comments		|| 0, 10);
      activity.activity_id	= apiData.id;
      activity.plus_oners		= parseInt(apiData.plus_oners	|| 0, 10);
      activity.date			= $rootScope.utils.dateToCommonString(new Date(apiData.post_date));
      activity.id				= apiData.id;
      activity.product_group	= apiData.product_groups;
      activity.activity_type	= apiData.activity_types;
      activity.deleted	= apiData.deleted;
      //Activity Types as string for table ordering
      var toRet = '';
      if (activity.activity_type !=null && activity.activity_type.length>0){
        activity.activity_type.forEach(function(item){
          if(toRet.length>0){
            toRet+=',';
          }
          toRet+=item;
        });
			}
			activity.activity_types_str = toRet;
			activity.total_impact	= parseFloat(parseFloat(apiData.total_impact	|| 0).toFixed(2));//Use to fixed instead of round(x*100)/100 to avoid float strage behavior
      activity.social_impact = parseInt(apiData.social_impact	|| 0, 10);
      activity.meta_impact = parseInt(apiData.meta_impact	|| 0, 10);
			//console.log(activity);
			return activity;
		},
		'updateStats'				: function(dataset,	apiData)
		{
		  dataset.social_impact_raw	= (dataset.social_impact_raw	|| 0) + parseInt(apiData.social_impact	|| 0, 10);
			dataset.meta_impact_raw	= (dataset.meta_impact_raw	|| 0) + parseInt(apiData.meta_impact	|| 0, 10);
			dataset.social_impact	= parseFloat(parseFloat(dataset.social_impact	|| 0.00) + log10(parseFloat(apiData.social_impact	|| 0.00, 10))).toFixed(2);
			dataset.meta_impact	= parseFloat(parseFloat(dataset.meta_impact	|| 0.00) + log10(parseFloat(apiData.meta_impact	|| 0.00, 10))).toFixed(2);
			dataset.total_impact	= parseFloat((parseFloat(dataset.total_impact		|| 0.00) + parseFloat(apiData.total_impact	|| 0)).toFixed(2));

		},
		'addMetricColumns'			: function(chartData)
		{
		  chartData.cols.push(
			{
				id		: 'total_impact',
				label	: 'Total Impact',
				type	: 'number'
			});
			chartData.cols.push(
			{
				id		: 'activitiesLogged',
				label	: 'Activities Logged',
				type	: 'number'
			});
			chartData.cols.push(
			{
				id		: 'social_impact',
				label	: 'Social Impact',
				type	: 'number'
			});
			chartData.cols.push(
			{
				id		: 'meta_impact',
				label	: 'Metadata Impact',
				type	: 'number'
			});

		  chartData.cols.push(
			{
				id		: 'social_impact_raw',
				label	: 'Social Impact (RAW)',
				type	: 'number'
			});
			chartData.cols.push(
			{
				id		: 'meta_impact_raw',
				label	: 'Metadata Impact (RAW)',
				type	: 'number'
			});


		},
		'chartDataRow'				: function(label,	activityRecord, useCountry,showGDEName)
		{
			var row					= {c:[]};

			var activitiesLogged	= activityRecord.activities.length;
			var social_impact		= activityRecord.social_impact;
			var meta_impact		= activityRecord.meta_impact;
			var total_impact		= activityRecord.total_impact;
			var social_impact_raw		= activityRecord.social_impact_raw;
			var meta_impact_raw		= activityRecord.meta_impact_raw;


			row.c.push({v:label});
			if (useCountry){
			  row.c.push({v:activityRecord.country});
			}
			if (showGDEName){
			  row.c.push({v:activityRecord.gde_name});
			}
			row.c.push({v:total_impact});
			row.c.push({v:activitiesLogged});
			row.c.push({v:social_impact});
			row.c.push({v:meta_impact});
			row.c.push({v:social_impact_raw});
			row.c.push({v:meta_impact_raw});

			return row;
		},
		'dateToCommonString'		: function(origDate)
		{
			var yyyy	= origDate.getFullYear().toString();
			var mm		= (origDate.getMonth()+1).toString();	// getMonth() is zero-based
			var dd		= origDate.getDate().toString();

			return '' + yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]);	// padding
		},
		'verifyDateStringFormat'	: function(origStringDate)
		{
			var dateParts	= origStringDate.split('-');
			if (dateParts.length != 3)
			{
				return 'Invalid Date';
			}else
			{
				return origStringDate;
			}
		},
		'activityTypesFromApi'		: function(gdeTrackingAPI)
		{
			//Create request data object
			var requestData		= {};
			requestData.limit	= 100;

			gdeTrackingAPI.activity_type.list(requestData).execute(
				function(response)
				{
					$rootScope.activityTypes	= response.items;
				}
			);
		},
		'productGroupsFromApi'		: function(gdeTrackingAPI)
		{	//Create request data object
			var requestData		= {};
			requestData.limit	= 100;

			gdeTrackingAPI.product_group.list(requestData).execute(
				function(response)
				{
					$rootScope.productGroups	= response.items;
				}
			);
		},
		'activityGroupsFromApi':function(gdeTrackingAPI)
		{	//Create request data object
			var requestData		= {};
			requestData.limit	= 100;

			gdeTrackingAPI.activity_group.list(requestData).execute(
				function(response)
				{
					$rootScope.activityGroups	= response.items;
				}
			);
		},
		'gdeListFromApi':function(gdeTrackingAPI,nextPageToken)
		{	//Create request data object
			var requestData = {};
      requestData.limit=100;
      requestData.type = 'active';
      requestData.pageToken=nextPageToken;
      //Load the GDE list once for all the application
      gdeTrackingAPI.account.list(requestData).execute(
        function(response)
        {
          if (!$rootScope.gdeList){
            $rootScope.gdeList=[];
          }
          response.items.forEach(function(item){
            //exclude deleted
            if (item.deleted==false){
              $rootScope.gdeList.push(item);
            }

          });

          //See if more data need to be fetched
          if (response.nextPageToken){
            //Load more data
            $rootScope.utils.gdeListFromApi(gdeTrackingAPI,response.nextPageToken);
          }else{
            $rootScope.metadataReady=true;
            $rootScope.$broadcast('event:metadata-ready',gdeTrackingAPI);
          }
        }
      );
		}
	};

	$rootScope.$on('event:gde-app-back-end-ready', function(event, gdeTrackingAPI)
	{	//Load Metadata from the API
		$rootScope.utils.activityTypesFromApi(gdeTrackingAPI);
		$rootScope.utils.productGroupsFromApi(gdeTrackingAPI);
		$rootScope.utils.activityGroupsFromApi(gdeTrackingAPI);
		$rootScope.utils.gdeListFromApi(gdeTrackingAPI);

	});


});
