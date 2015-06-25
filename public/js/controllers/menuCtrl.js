// *****************************************************************************************************
//    									Menu Controller
// *****************************************************************************************************
GdeTrackingApp.controller("menuCtrl",							function($scope,	$location)
{
	$scope.showGeneralStatisticsForGooglers	= function()	// Click detection
	{
//		console.log('showGeneralStatisticsForGooglers');
		$location.path('/generalStatisticsForGooglers');
		//MSO - 20140813 - Close the drawer
		document.getElementById('drawerPanel').togglePanel();
	};
	$scope.showGdeStatistics				= function()	// Click detection
	{
//		console.log('showGdeStatistics');
		$location.path('/myStatistics');
		//MSO - 20140813 - Close the drawer
		document.getElementById('drawerPanel').togglePanel();

	};
});