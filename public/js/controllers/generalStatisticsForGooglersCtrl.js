// *****************************************************************************************************
//    								Statistics Controller for Googlers
// *****************************************************************************************************
GdeTrackingApp.controller("generalStatisticsForGooglersCtrl",	function($rootScope, $scope,	$location,	$http,	months,	years)
{
  $scope.gdeTrackingAPI = null;
  if ($rootScope.is_backend_ready){
    $scope.gdeTrackingAPI = gapi.client.gdetracking;
  }

	$('paper-fab')		.css('-webkit-animation',	'hideFab	1s	linear	1	both');	//	-webkit- CSS3 animation
	$('paper-fab')		.css('animation',			'hideFab	1s	linear	1	both');	//	W3C	CSS3 animation

	$scope.months				= months;
	$scope.years				= years;
	$scope.products     = [];
	$scope.includeDeleted = false;

	// ------------------------------------
	//		Initialize local data
	// ------------------------------------
	$scope.initChartArrays = function(){
	  $scope.data							= {};
  	$scope.data.items					= [];

  	$scope.top100activities				= [];
  	$scope.activityBy = {
  	  'GDE':{},
  	  'Product':{},
  	  'Activity':{},
  	  'Region':{},
  	};

	};

	$scope.initChartArrays();

	// ------------------------------------
	//		Date Range Filter
	// ------------------------------------
	$scope.dateFilter				= function (){
		if ( $scope.monthSelected && $scope.yearSelected )
		{
			// ------------------------------------
			//		Reset local data
			// ------------------------------------
			$scope.initChartArrays();

      //console.log($scope.monthSelected.value + " " + $scope.yearSelected.value);
			loadingToast.show();
			$('.forGooglers')	.css('display','block');

			$scope.monthSince				= months.indexOf($scope.monthSelected) + 1;
			$scope.yearSince				= $scope.yearSelected.value;
			if ($rootScope.is_backend_ready)
			{
			  var minDate		= $scope.yearSince +'-'+ ($scope.monthSince<10?"0":"")+$scope.monthSince; //Format date into YYYY/MM
			  $scope.getactivitiesFromGAE(null,null,minDate,null,null,$scope.includeDeleted);	// Get the activities
			}
		}
	};
	// ------------------------------------
  $scope.productFilter				= function (){
	  // ------------------------------------
		//		Reset local data
		// ------------------------------------
		$scope.initChartArrays();

		if ( $scope.monthSelected && $scope.yearSelected )
		{
      $scope.dateFilter();
		}else{
		  //console.log($scope.monthSelected.value + " " + $scope.yearSelected.value);
			loadingToast.show();
			$('.forGooglers')	.css('display','block');
		  $scope.getactivitiesFromGAE(null,null,null,null,null,$scope.includeDeleted);	// Get the activities
		}
	};

	var drawChart = function(prefix,key){
    var activitiesClone = [];

    //Push the activities in a new array to be safe when adding infos for the charts
    $.each($scope.activityBy[prefix],	function(k,v){
      activitiesClone.push($scope.activityBy[prefix][k]);
    });

	  var activitiesBy = {
			cols: [
				{
					id		: prefix,
					label	: prefix,
					type	: 'string'
				}
			],
			rows: []
		};

		var useCountry = false;
		//Check the prefix to see it the country column needs to be added
		if(prefix=='Region'){
      activitiesBy.cols.push({
        id		: 'country',
				label	: 'Country',
				type	: 'string'
		  });
		  useCountry = true;
		}

		//Add Shared Metrics columns
		$scope.utils.addMetricColumns(activitiesBy);

		//Create Chart rows and add them to the object for the chart
		for (var i=0;i<activitiesClone.length;i++)
		{

			activitiesBy.rows.push(
				$scope.utils.chartDataRow(activitiesClone[i][key], activitiesClone[i],useCountry)
			);
		}

		//Get the DataVisualization object
		var activitiesBy_data = new google.visualization.DataTable(activitiesBy);
		activitiesBy_data.sort(1);

		//Sliders and Selector to filter the table and chart
		var keySelector = new google.visualization.ControlWrapper();
		keySelector.setControlType('CategoryFilter');
		keySelector.setContainerId(prefix+'_selector');
		keySelector.setOptions(
		{
			'filterColumnLabel'	: prefix,
			'ui':
			{
				'caption'				: prefix + ' ...',
				'labelStacking'			: 'vertical',
				'selectedValuesLayout'	: 'belowStacked',
				'allowTyping'			: true,
				'allowMultiple'			: true
			}
		});

		var activitiesSlider = new google.visualization.ControlWrapper();
		activitiesSlider.setControlType('NumberRangeFilter');
		activitiesSlider.setContainerId(prefix+'_activitiesSlider');
		activitiesSlider.setOptions(
		{
			'filterColumnLabel': 'Activities Logged',
			'ui':
			{
				'labelStacking': 'vertical'
			}
		});

		var socialImpactSlider = new google.visualization.ControlWrapper();
		socialImpactSlider.setControlType('NumberRangeFilter');
		socialImpactSlider.setContainerId(prefix+'_socialImpactSlider');
		socialImpactSlider.setOptions(
		{
			'filterColumnLabel': 'Social Impact',
			'ui':
			{
				'labelStacking': 'vertical'
			}
		});

		var metaImpactSlider = new google.visualization.ControlWrapper();
		metaImpactSlider.setControlType('NumberRangeFilter');
		metaImpactSlider.setContainerId(prefix+'_metaImpactSlider');
		metaImpactSlider.setOptions(
		{
			'filterColumnLabel': 'Metadata Impact',
			'ui':
			{
				'labelStacking': 'vertical'
			}
		});

		var impactSlider = new google.visualization.ControlWrapper();
		impactSlider.setControlType('NumberRangeFilter');
		impactSlider.setContainerId(prefix+'_impactSlider');
		impactSlider.setOptions(
		{
			'filterColumnLabel': 'Total Impact',
			'ui':
			{
				'labelStacking': 'vertical'
			}
		});

		var chartWidth		= $("#generalStatisticsBy"+prefix).width()-20;

		//Create the table
		var TableChart = new google.visualization.ChartWrapper();
		TableChart.setChartType('Table');
		TableChart.setContainerId(prefix+'_TableChart');
		TableChart.setOptions(
		{
		  'width':chartWidth,
			'sortColumn': 1,
			'sortAscending': false,
			'page': 'enable',
			'pageSize':30
		});

		var realChart = null;
		//For GDE Create a Pie Chart, for others create a BarChart
		if (prefix=='GDE'){
		  var gdePieChart = new google.visualization.ChartWrapper();
      gdePieChart.setChartType('PieChart');
      gdePieChart.setContainerId('GDE_PieChart');
      var offset= 0.2;
      var slices= [];
      for (i=0;i<20;i++)
      {
        var slice	= {'offset':offset};
        offset = offset - 0.002;
        slices.push(slice);
      };
      for (i=0;i<160;i++)
      {
        var slice	= {'offset':offset};
        offset = offset - 0.001;
        slices .push(slice);
      };
      //console.log(slices);
      gdePieChart.setOptions(
      {
        'width'				: 570,
        'pieHole'			: 0.5,
        'reverseCategories'	: true,
        'pieStartAngle'		: 30,
        'slices'			: slices,
        'legend'			:
        {
          'position'	: 'none'
        }
      });

      realChart=gdePieChart;

		}else{
		  //Bar Chart


      var BarChart = new google.visualization.ChartWrapper();
      BarChart.setChartType('BarChart');
      BarChart.setContainerId(prefix+'_BarChart');
      BarChart.setOptions(
      {
        'width':chartWidth,
        'height': 500,
        'isStacked': true,
        'reverseCategories'	: true,
        'legend':
        {
          'position'	:'top',
          'alignment'	:'center',
          'maxLines'	:3
        }
      });
      //Region Chart avoid showing region
      if(prefix=='Region'){
        BarChart.setView({'columns': [1,2,3,4,5]});//Show only the log10 columns
      }
      else{
        BarChart.setView({'columns': [0,1,2,3,4]});//Show only the log10 columns
      }
      realChart=BarChart;
		}

		//Display the Charts
		var dashboard = new google.visualization.Dashboard(document.getElementById('generalStatisticsBy'+prefix));

		dashboard.bind( [keySelector,activitiesSlider,socialImpactSlider,metaImpactSlider,impactSlider],
                    TableChart);
    dashboard.bind( [keySelector,activitiesSlider,socialImpactSlider,metaImpactSlider,impactSlider],
                    realChart);

    dashboard.draw(activitiesBy_data);

	};

	var drawGeneralStatistics		= function ()
	{
		//===============================================//
		// For every Activity in $scope.top100activities
		//===============================================//
		var top100 = {
			cols: [
				{
					id		: 'title',
					label	: 'Title',
					type	: 'string'
				},
				{
					id		: 'gde_name',
					label	: 'GDE Name',
					type	: 'string'
				}
			],
			rows: []
		};
		
		$scope.utils.addMetricColumns(top100);
		for (var i=0;i<$scope.top100activities.length;i++)
		{
			top100.rows.push(
				$scope.utils.chartDataRow($scope.top100activities[i].title, $scope.top100activities[i],null,true)
			);
		}

		var top100activitiesByGde_data		= new google.visualization.DataTable(top100);
		
		//===============================================//
		// Sort Activities by Impact - $scope.top100activities
		//===============================================//
		var top100TableChart			= new google.visualization.ChartWrapper();
		top100TableChart				.setChartType('Table');
		top100TableChart				.setContainerId('top100activitiesChart');
		top100TableChart				.setOptions(
		{
			'sortColumn': 2,
			'sortAscending': false,
			'page': 'enable',
			'pageSize':10
		});

		top100TableChart.setDataTable(top100activitiesByGde_data);

		top100TableChart.draw();

		//By GDE Charts
		drawChart('GDE','name');

		//By Product Charts
		drawChart('Product','product');

		//By GDE Charts
		drawChart('Activity','activity_type');

		//By GDE Charts
		drawChart('Region','region');

		loadingToast.dismiss();
	};

	var loadingToast	= document.querySelector('paper-toast[id="loading"]');	// Called to show loading sign
	$scope.loadVisualizationLibraries = google.load('visualization', '1.1', null);
	loadingToast.show();
	$('.forGooglers')	.css('display','block');

	$scope.getactivitiesFromGAE = function (nextPageToken,gplusId,minDate,maxDate,order,includeDeleted)
	{
	  //Create request data object
    var requestData			= {};
    requestData.limit		= 100;
    requestData.gplus_id	= gplusId;
    requestData.pageToken	= nextPageToken;
    requestData.minDate		= minDate;
    requestData.maxDate		= maxDate;
    requestData.order		= order;
    requestData.includeDeleted=includeDeleted;

    $scope.gdeTrackingAPI.activity_record.list(requestData).execute(
		function(response)
    {	//Check if the backend returned and error
			if (response.code)
			{
				window.alert('There was a problem loading the app. This windows will be re-loaded automatically. Error: '+response.code + ' - '+ response.message);
				location.reload(true);
			}else
			{	//Everything ok, keep going
        if (response.items)	// If there is data
        {	//Add response Items to the full list

          //Filter the data for product if the product is selected
          if ($scope.productSelected){
            response.items.forEach(function(item){
              if (item.product_groups){
                item.product_groups.some(function(pg){
                  if (pg==$scope.productSelected.tag){
                    $scope.data.items.push(item);
                  }
                });
              }
            });
          }else{
            $scope.data.items = $scope.data.items.concat(response.items);
          }
        } else
        {
          window.alert('There are no recorded activities at the date range you selected.');
        }

        if (response.nextPageToken)	// If there is still more data
        {	// Get the next page
          $scope.getactivitiesFromGAE(response.nextPageToken,gplusId,minDate,maxDate,order,includeDeleted);
        } else if (response.items)
        {
					//console.log($scope.data.items);
          for (var i=0;i<$scope.data.items.length;i++)
          {
            var activity = $scope.utils.activityFromApi($scope.data.items[i]);
            //Store the activity for later processing
            
            var top100act = {title:activity.title,gde_name:activity.gde_name, activities:[activity]};
            $scope.utils.updateStats(top100act, $scope.data.items[i]);
            $scope.top100activities.push(top100act);

            //===============================================//
            // activities by GDE Name
            //===============================================//
            var name = $scope.data.items[i].gde_name;

            if (!$scope.activityBy['GDE'][name])
            {
              $scope.activityBy['GDE'][name] = {};	// Initialize a new JSON unordered array

              $scope.activityBy['GDE'][name]['name'] = name;
              $scope.activityBy['GDE'][name]['id'] = $scope.data.items[i].gplus_id;

              $scope.activityBy['GDE'][name]['activities'] = [];	// Initialize a new JSON ordered array
            }

            $scope.utils.updateStats($scope.activityBy['GDE'][name], $scope.data.items[i]);

            $scope.activityBy['GDE'][name]['activities'].push(activity);

            //===============================================//
            // activities by Product
            //===============================================//
            if ($scope.data.items[i].product_groups)
            {
              for (var j=0;j<$scope.data.items[i].product_groups.length;j++)
              {
                var product = $scope.data.items[i].product_groups[j];
                //Get the Product Description
                $rootScope.productGroups.some(function(pg){
                  if (pg.tag==product){
                    product = pg.description;
                    return true;
                  }else{
                    return false;
                  }
                });

                if (!$scope.activityBy['Product'][product])
                {
                  $scope.activityBy['Product'][product] = {};	// Initialize a new JSON unordered array

                  $scope.activityBy['Product'][product]['product'] = product

                  $scope.activityBy['Product'][product]['activities'] = [];	// Initialize a new JSON ordered array
                }

                $scope.utils.updateStats($scope.activityBy['Product'][product], $scope.data.items[i]);

                $scope.activityBy['Product'][product]['activities'].push(activity);

              }

            };
            //===============================================//
            // activities by Activity Type
            //===============================================//
            if ($scope.data.items[i].activity_types)
            {
              for (j=0;j<$scope.data.items[i].activity_types.length;j++)
              {
                var activity_type = $scope.data.items[i].activity_types[j];
                //Get Activity Type Description
                $rootScope.activityTypes.some(function(at){
                  if(activity_type==at.tag){
                    activity_type= at.id;
                    return true;
                  }else{
                    return false;
                  }

                });

                if (!$scope.activityBy['Activity'][activity_type])
                {
                  $scope.activityBy['Activity'][activity_type] = {};	// Initialize a new JSON unordered array

                  $scope.activityBy['Activity'][activity_type]['activity_type'] = activity_type

                  $scope.activityBy['Activity'][activity_type]['activities'] = [];	// Initialize a new JSON ordered array
                }
                $scope.utils.updateStats($scope.activityBy['Activity'][activity_type], $scope.data.items[i]);

                $scope.activityBy['Activity'][activity_type]['activities'].push(activity);

              }
            };
            //===============================================//
            // activities by GDE Region
            //===============================================//
            //Get the user account for the activity
            var country = null;
            var region = null;
            var currDtItm = $scope.data.items[i];
            $rootScope.gdeList.some(function(accn){
              if (accn.gplus_id==currDtItm.gplus_id){
                country = accn.country;
                region = accn.region;
                return true;
              }
              return false;
            });

            if (!$scope.activityBy['Region'][country])
            {
              $scope.activityBy['Region'][country] = {}; // Initialize a new JSON unordered array

              $scope.activityBy['Region'][country]['region'] = region;
              $scope.activityBy['Region'][country]['country'] = country;
              $scope.activityBy['Region'][country]['activities'] = [];  // Initialize a new JSON ordered array
            }
            $scope.utils.updateStats($scope.activityBy['Region'][country], $scope.data.items[i]);

            $scope.activityBy['Region'][country]['activities'].push(activity);
            //===============================================//
          };

          //sort by total_impact
          $scope.top100activities.sort(function(a,b){
            return b.total_impact-a.total_impact;
          });
          //keep only the first 100
          if ($scope.top100activities.length>100){
            $scope.top100activities=$scope.top100activities.splice(0,100);
          }

          drawGeneralStatistics();

        };
			}

    });
	};

	// -------------------------------------
	//  Start showing last month statistics
	// -------------------------------------
	var today						= new Date();

	$scope.monthSince				= today.getMonth() + 1;
	$scope.yearSince				= today.getFullYear();

  //MSO - 20150106 - Set month and Year selected
  $scope.monthSelected = $scope.months[$scope.monthSince-1];
  $scope.years.some(function(item){
    if (item.value==""+$scope.yearSince){
      $scope.yearSelected = item;
      return true;
    }
    return false;
  });

	if ($rootScope.is_backend_ready){
	  $scope.products=$rootScope.productGroups;

	  var minDate	= $scope.yearSince +'-'+ ($scope.monthSince<10?"0":"")+$scope.monthSince; //Format date into YYYY/MM
	  $scope.getactivitiesFromGAE(null,null,minDate,null,null,$scope.includeDeleted);	// Get the activities
	}

	// -------------------------------------
	//MSO - 20140806 - should never happen, as we redirect the user to the main page if not logged in, but just in case keep is
	$scope.$on('event:metadata-ready', function (event, gdeTrackingAPI)
	{
		console.log('generalStatisticsForGooglersCtrl: metadata-ready received' + ' ' + new Date().toUTCString());
    $scope.products=$rootScope.productGroups;
		//Save the API object in the scope
		$scope.gdeTrackingAPI = gdeTrackingAPI;
		//Get data from the backend only if activities are not already loaded
		if($scope.data.items.length==0){
		  //run the function to get data from the backend
		  var minDate             = $scope.yearSince +'-'+ ($scope.monthSince<10?"0":"")+$scope.monthSince; //Format date into YYYY/MM
		  $scope.getactivitiesFromGAE(null,null,minDate,null,null,$scope.includeDeleted);	// Get the activities
		}

	});

	$scope.updateIsDeleted = function(){
	  // ------------------------------------
		//		Reset local data
		// ------------------------------------
		$scope.initChartArrays();

	  var minDate	= $scope.yearSince +'-'+ ($scope.monthSince<10?"0":"")+$scope.monthSince; //Format date into YYYY/MM
	  //as this function is called before !$scope.includeDeleted is updated, call the function with the inverted value
	  $scope.getactivitiesFromGAE(null,null,minDate,null,null,!$scope.includeDeleted);	// Get the activities
	}

});
