// *****************************************************************************************************
//    								Statistics Controller for GDE
// *****************************************************************************************************
GdeTrackingApp.controller("myStatisticsCtrl",					function($scope,	$location,	$http,	$rootScope,	months, years)
{
  $scope.gdeTrackingAPI = null;
  if ($rootScope.is_backend_ready){
    $scope.gdeTrackingAPI = gapi.client.gdetracking;
  }

	var loadingToast	= document.querySelector('paper-toast[id="loading"]');	// Show loading sign
	loadingToast.show();

	$('paper-fab')		.css('-webkit-animation',	'hideFab	1s	linear	1	both');	//	-webkit- CSS3 animation
	$('paper-fab')		.css('animation',			'hideFab	1s	linear	1	both');	//	W3C	CSS3 animation

	$scope.months				= months;
	$scope.years				= years;
	$scope.monthSelected		= "";
	$scope.yearSelected			= "";

	$scope.newMonth				= function (newMonth)
	{
		console.log(newMonth);
	};
	$scope.newYear				= function (newYear)
	{
		console.log(newYear);
	};

  // ----------------------------------------------
  // .............My General Statistics............
  // ----------------------------------------------
	$scope.activitiesByGdeName		= [];
	$scope.data					= {};
	$scope.data.items			= [];
	$scope.activitiesByGdeNameTemp	= {};
	$scope.name					= $rootScope.userName;
	$scope.userActivities			= [];

	$scope.includeDeleted = false;

	$scope.sort = {
      column: 'date',
      descending: true
  };
  $scope.changeSorting = function(column) {

      var sort = $scope.sort;

      if (sort.column == column) {
          sort.descending = !sort.descending;
      } else {
          sort.column = column;
          sort.descending = false;
      }
  };

	var drawGeneralStatistics	= function ()
	{	// For every GDE in activitiesByGdeNameTemp
    //		console.log('drawGeneralStatistics initiated');
    $scope.activitiesByGdeName = [];
		$.each($scope.activitiesByGdeNameTemp, function(k,v)
		{
			$scope.activitiesByGdeName.push($scope.activitiesByGdeNameTemp[k]); // Push it as a new object in a JSON ordered array.
		});
    //		console.log($scope.activitiesByGdeName);
		var activitiesByGde =
		{
			cols:
			[
				{
					id		: 'gdeName',
					label	: 'GDE',
					type	: 'string'
				}
			],
			rows	: []
		};
		$scope.utils.addMetricColumns(activitiesByGde);

		for (var i=0;i<$scope.activitiesByGdeName.length;i++)
		{
			activitiesByGde.rows.push(
				$scope.utils.chartDataRow($scope.activitiesByGdeName[i].name, $scope.activitiesByGdeName[i])
			);
		};
    //		console.log(activitiesByGde);

    var chartWidth		= $("#generalStatisticsByGDE").width()-10;

		// Sort data by Total Activities
		var activitiesByGde_data		= new google.visualization.DataTable(activitiesByGde);
		activitiesByGde_data.sort(1);

		var gdeTableChart 		= new google.visualization.ChartWrapper();
		gdeTableChart.setChartType('Table');
		gdeTableChart.setContainerId('gdeTableChart');
		gdeTableChart.setOptions(
		{
		  'width':chartWidth,
			'sortColumn'	: 1,
			'sortAscending'	: false,
			'page'			: 'enable',
			'pageSize'		: 30
		});
		gdeTableChart.setDataTable(activitiesByGde_data);

		var gdeColumnChart 		= new google.visualization.ChartWrapper();
		gdeColumnChart.setChartType('ColumnChart');
		gdeColumnChart.setContainerId('gdeColumnChart');


		gdeColumnChart.setOptions(
		{
			'width'				:chartWidth,
			'reverseCategories'	: true,
			'legend':
			{
				'position'	:'top',
				'alignment'	:'center',
			}
		});
		gdeColumnChart.setDataTable(activitiesByGde_data);
		gdeColumnChart.setView({'columns': [0,1,2,3,4]});//Show only the log10 columns
		gdeColumnChart.draw();
		gdeTableChart.draw();
	}

	$scope.loadVisualizationLibraries	= google.load('visualization', '1.1', null);

  var prepareActivitiesForChart = function(includeDeleted)
  {
    var loggedGdeName = $rootScope.userName;
    var loggedGdePlusID = $rootScope.usrId;
    $scope.name = $rootScope.userName;
    $scope.userActivities=[];
    if (includeDeleted==null){
      includeDeleted = $scope.includeDeleted;
    }

    $scope.activitiesByGdeNameTemp[$scope.name]					= {};	// Initialize a new JSON unordered array
    $scope.activitiesByGdeNameTemp[$scope.name]['name']			= loggedGdeName;
    $scope.activitiesByGdeNameTemp[$scope.name]['id']				= loggedGdePlusID;
    $scope.activitiesByGdeNameTemp[$scope.name]['activities']			= [];	// Initialize a new JSON ordered array

    for (var i=0;i<$scope.data.items.length;i++)
    {
      var addToArrays = true;
      //Check if the deleted activities should be displayed in the charts
      if (!includeDeleted){
        //Exclude deleted Activities
        if ($scope.data.items[i].deleted){
          addToArrays=false;
        }

      }
      if (addToArrays){
        $scope.utils.updateStats($scope.activitiesByGdeNameTemp[$scope.name], $scope.data.items[i]);

        var activity = $scope.utils.activityFromApi($scope.data.items[i]);
        $scope.activitiesByGdeNameTemp[$scope.name]['activities'].push(activity);
        $scope.userActivities.push(activity);
      }
    };
    $scope.$apply();
    drawGeneralStatistics();
  }

	$scope.getActivitiesFromGAE = function (nextPageToken,gplusId,minDate,maxDate,order)
	{
	  //Empty the scope objects on the first run
	  if (!nextPageToken){
	    $scope.activitiesByGdeName		= [];
    	$scope.data.items			= [];
    	$scope.activitiesByGdeNameTemp	= {};
    	$scope.name					= '';
    	$scope.userActivities			= [];
	  }

		//Create request data object
    var requestData = {};
    requestData.limit=100;
    requestData.gplus_id = gplusId;
    requestData.pageToken=nextPageToken;
    requestData.minDate=minDate;
    requestData.maxDate=maxDate;
    requestData.order=order;
    requestData.includeDeleted=true;

    $scope.gdeTrackingAPI.activity_record.list(requestData).execute(
      function(response)
      {

        //Check if the backend returned and error
        if (response.code){
          window.alert('There was a problem loading the app. This windows will be re-loaded automatically. Error: '+response.code + ' - '+ response.message);
          location.reload(true);
        }else{
          //Add response Items to the full list
          $scope.data.items = $scope.data.items.concat(response.items);

          if (response.nextPageToken)	// If there is still more data
          {
            $scope.getActivitiesFromGAE(response.nextPageToken,gplusId,minDate,maxDate,order);	// Get the next page
          } else{// Done
            loadingToast.dismiss();
            //console.log($scope.data.items);
            if ($rootScope.usrId)// Check if the user it's an authorized user.
            {
              prepareActivitiesForChart();
            } else {// Wait for a valid GDE to log in.
              //console.log('User was not logged in');
              $scope.$on('gde:logged', function(event,loggedGdeName)				// Listen to the gde:logged
              {
                prepareActivitiesForChart();
              });
            }
          }
        };
      }
		);
	};

	if ($rootScope.is_backend_ready){
	  $scope.getActivitiesFromGAE(null,$rootScope.usrId,null,null,null);	// Get the GDE Activites
	}

	//MSO - 20140806 - should never happen, as we redirect the user to the main page if not logged in, but just in case keep it
	$scope.$on('event:metadata-ready', function (event, gdeTrackingAPI)
	{
		console.log('myStatisticsCtrl: metadata-ready received' + ' ' + new Date().toUTCString());

		//Save the API object in the scope
		$scope.gdeTrackingAPI = gdeTrackingAPI;
		//Get data from the backend only if activities are not already loaded
		if($scope.data.items.length==0){
		  //run the function to get data from the backend
		  $scope.getActivitiesFromGAE(null,$rootScope.usrId,null,null,null);// Get the GDE Activites
		}

	});
	$scope.$watch('includeDeleted', function(newValue, oldValue){

    // Check if value has changes
    if(newValue != oldValue){
      prepareActivitiesForChart(newValue);
    }
  });

	//Edit/new an Activity
	$scope.currentActivity			= null;
	$scope.selectedAG			      = null;
	$scope.editMode			        = "";
	$scope.currentActivityPosts = [];
	$scope.usedInMetadata       = {};

	var getActivityPosts = function (activityRecord){
    $scope.currentActivityPosts = []; //Clean the array
    if (activityRecord.gplus_posts){
      //Get the all the posts
      $.each(activityRecord.gplus_posts,
        function(index,value){
          console.log('loading:'+value);
          var requestData = {};
          requestData.limit=1;
          requestData.id = value;

          $scope.gdeTrackingAPI.activity_post.get(requestData).execute(
            function(response)
        		{
        		  //Check if the backend returned and error
              if (response.code){
                console.log('gdeTrackingAPI.activity_post.get('+value+') responded with Response Code: '+response.code + ' - '+ response.message + ' ' + new Date().toUTCString());
              }else{
                //Push the ActivityPost to the array
                $scope.currentActivityPosts.push(response);
                $scope.$apply();
              }

        		}
        	);
        }
      );
    }
  }

  var populatePGs = function(){
    $scope.currProductGroupList=[];
	  $.each($rootScope.productGroups, function(k,v)
		{
		  var pgSelector = $rootScope.productGroups[k];
		  if ($scope.currentActivity.product_groups){
		    pgSelector.selected = ($scope.currentActivity.product_groups.indexOf(pgSelector.tag)>=0);
		  }else{
		    pgSelector.selected = false;
		  }

			$scope.currProductGroupList.push(pgSelector); // Push it as a new object in a JSON array.
		});

  };

  var populateATs = function(){
    $scope.currActivityTypesList=[];
	  $.each($rootScope.activityTypes, function(k,v)
		{
		  var actSelector = $rootScope.activityTypes[k];

		  if ($scope.currentActivity.activity_types){
		    actSelector.selected = ($scope.currentActivity.activity_types.indexOf(actSelector.tag)>=0);
		  }else{
		    actSelector.selected = false;
		  }

			$scope.currActivityTypesList.push(actSelector); // Push it as a new object in a JSON array.
		});
  };

  var populateAGs = function(){
    $scope.currActivityGroups =[];

    //Loop over the activity and get the activity group of the selected
    $scope.currActivityTypesList.forEach(function(item){

      if (item.selected){
        //search the currActivityGroups to see if the current group is already in the content list
        var result = $.grep($scope.currActivityGroups, function(e){ return e.tag == item.group; });
        if (result.length==0){
          //Get the ActivityGroup
          $rootScope.activityGroups.some(function(ag){
            if(ag.tag==item.group){
              $scope.currActivityGroups.push(ag);
              $scope.updateAG(ag.tag); //Update the Medatada AGs

              return true;
            }
            return false;
          });
        }
      }

    });

    //Reorder the AGs
		if ($scope.currActivityGroups.length>1){
  		$scope.currActivityGroups =
  		  $scope.currActivityGroups.sort(function(a,b){
              var A = a.id.toLowerCase();
              var B = b.id.toLowerCase();
              if (A < B){
                return -1;
              }else if (A > B){
                return  1;
              }else{
                return 0;
              }
          });
		}
		if ($scope.currActivityGroups.length>0){
      //Set the selected tab the first
      $("#AGTabs").prop('selected',0);
      $("#core_animated_pages").prop('selected',0);
      $scope.selectAGIdx=0;
      $scope.selectedAG=$scope.currActivityGroups[0];
      var tmpMetaArray = [];
      //Remove the unused activity_categories
      $scope.currActivityGroups.forEach(function(item){
        //search in the categoty list
        $scope.metadataArray.some(function(meta){
          if (meta.activity_group == item.tag){
            tmpMetaArray.push(meta);
            return true;
          }
          return false;
        });
      });
      $scope.metadataArray = tmpMetaArray;

		}else{
      //Clean the metadataObject
      $scope.metadataArray=[];
		}

  };

  var setCurrActivityDefaults = function(){
    //Activity Defaults
    $scope.currentActivity.gplus_id = $rootScope.usrId;
    if ($scope.currentActivity.activity_title==null){
      $scope.currentActivity.activity_title='';
    }

    if($scope.currentActivity.activity_link == null){
      $scope.currentActivity.activity_link = '';
    }
    if ($scope.currentActivity.post_date == null){
      $scope.currentActivity.post_date = $rootScope.utils.dateToCommonString(new Date());
    }
    if ($scope.currentActivity.date_updated==null){
      $scope.currentActivity.date_updated = $rootScope.utils.dateToCommonString(new Date());
    }
    if ($scope.currentActivity.date_created ==null){
      $scope.currentActivity.date_created = $rootScope.utils.dateToCommonString(new Date());
    }
    if ($scope.currentActivity.activity_types==null){
      $scope.currentActivity.activity_types = [];
    }
    if ($scope.currentActivity.product_groups==null){
      $scope.currentActivity.product_groups = [];
    }
    if ($scope.currentActivity.gplus_posts==null){
      $scope.currentActivity.gplus_posts = [];
    }

    if ($scope.currentActivity.plus_oners==null || $scope.currentActivity.plus_oners==""){
      $scope.currentActivity.plus_oners=0;
    }
    if ($scope.currentActivity.resharers==null || $scope.currentActivity.resharers==""){
      $scope.currentActivity.resharers=0;
    }
    if ($scope.currentActivity.comments==null || $scope.currentActivity.comments==""){
      $scope.currentActivity.comments=0;
    }

    //Metadata defaults
    if($scope.currentActivity.metadata==null){
      $scope.metadataArray = [];
    }else{
      $scope.metadataArray = $scope.currentActivity.metadata;
      if($scope.metadataArray.length>1){
        //Set the local array ordered by activity_group
        $scope.metadataArray =
          $scope.metadataArray.sort(function(a,b){
              var A = a.activity_group.toLowerCase();
              var B = b.activity_group.toLowerCase();
              if (A < B){
                return -1;
              }else if (A > B){
                return  1;
              }else{
                return 0;
              }
          });
      }
    }

  };

  $scope.showActivityTypes= function(){
    toggleDialog('selectActivityTypes');
  };

	$scope.showProductGroups= function(){
    toggleDialog('selectProductGroups');
  };

  $scope.showDelTrashDialog= function(activityId){
    $scope.delTrashActId = activityId;
    toggleDialog('delTrashDialog');
  }

  $scope.trashGDEActivity = function(senderEvent){
    var activityId = $scope.delTrashActId;

    //Remove the AR from the backend
    $scope.gdeTrackingAPI.activity_record.trash({id:activityId}).execute(
      function(resp){
        if (resp.code){
          console.log('gdeTrackingAPI.activity_record.trash({id:'+activityId+'}) responded with Response Code: '+resp.code + ' - '+ resp.message + ' ' + new Date().toUTCString());

          alert(resp.message);
        }else{
          senderEvent.target.closest('#delTrashDialog').toggle();

          //Get the item
          var item = $.grep($scope.data.items, function(item){
            return item.id== activityId;
          })[0];

          item.deleted=true;
          //remove the item from the array
          removeARfromList(resp.id);

          //Re push updated Item
          $scope.data.items.push(item);
          //Apply and refresh Charts
          $scope.$apply();

          prepareActivitiesForChart();
        }
    });
  }

  $scope.deleteGDEActivity = function(senderEvent){
    var activityId = $scope.delTrashActId;

    //Remove the AR from the backend
    $scope.gdeTrackingAPI.activity_record.delete({id:activityId}).execute(
      function(resp){
        if (resp.code){
          console.log('gdeTrackingAPI.activity_record.delete({id:'+activityId+'}) responded with Response Code: '+resp.code + ' - '+ resp.message + ' ' + new Date().toUTCString());

          alert(resp.message);
        }else{
          senderEvent.target.closest('#delTrashDialog').toggle();
          //AR Deleted, remove from the table
          removeARfromList(resp.id);

          //Apply and refresh Charts
          $scope.$apply();
          prepareActivitiesForChart();

        }
    });
  }

  $scope.restoreActivity = function(activityId){

    //patch the item
    $scope.gdeTrackingAPI.activity_record.patch({id:activityId,resource:{deleted:false}}).execute(
      function(resp){
        if (resp.code){
          console.log('gdeTrackingAPI.activity_record.patch({id:'+activityId+'}) responded with Response Code: '+resp.code + ' - '+ resp.message + ' ' + new Date().toUTCString());

          alert(resp.message);
        }else{
          //remove the item from the array
          removeARfromList(activityId);

          //Update the local Array
          $scope.data.items.push(resp);

          //Apply and refresh Charts
          $scope.$apply();
          prepareActivitiesForChart();
        }
      });

  }

	$scope.editGDEActivity = function(activityId){
    //console.log(activityId)
    //Set the current Editing Activity
    $scope.currentActivity = $.grep($scope.data.items, function(item){
      return item.id== activityId;
    })[0];

    //Set the defaults
    setCurrActivityDefaults();

    //Populate Product Groups and Activities for the selection table
    populatePGs();
    populateATs();
    populateAGs();//Populate the ActivityGroups

	  //Formatted Dates
    $scope.currDate_updatedLocale = $rootScope.utils.dateToCommonString(new Date($scope.currentActivity.date_updated));
    $scope.currDate_createdLocale = $rootScope.utils.dateToCommonString(new Date($scope.currentActivity.date_created));
    $scope.currPost_dateLocale = $rootScope.utils.dateToCommonString(new Date($scope.currentActivity.post_date));

    $scope.currActLink= $scope.currentActivity.activity_link;

    $scope.editMode ="Edit";
    //Load ActivityPost Items for the current ActivityRecord
    getActivityPosts($scope.currentActivity);

    $("#fabDone").attr("disabled",false);//Enable the save button
    //Display the Edit Activity Dialog
    toggleDialog('singleActivity');

	};

	$scope.newActivity = function(showDialog){

    //Initialize the new Activity
    $scope.currentActivity ={};

    //Set the defaults
    setCurrActivityDefaults();

    //Populate Product Groups and Activities for the selection table
    populatePGs();
    populateATs();
    populateAGs();//Populate the ActivityGroups

    //Cleanups and defaults
    $scope.currentActivityPosts = [];

    $scope.currDate_updatedLocale = $rootScope.utils.dateToCommonString(new Date($scope.currentActivity.date_updated));
    $scope.currDate_createdLocale = $rootScope.utils.dateToCommonString(new Date($scope.currentActivity.date_created));
    $scope.currPost_dateLocale = $rootScope.utils.dateToCommonString(new Date($scope.currentActivity.post_date));
    $scope.currActLink= '';

    $scope.editMode = "Create New";

    if(showDialog==null || showDialog==true){
      $("#fabDone").attr("disabled",false);//Enable the save button
      //Display the Edit Activity Dialog
      toggleDialog('singleActivity');
    }
	}

	$scope.updCurrActivity = function(type){
    //console.log(type);
    if (type=='at'){
      $scope.currentActivity.activity_types = [];
      $.each($scope.currActivityTypesList, function(k,v)
      {
        var at = $scope.currActivityTypesList[k];
        if (at.selected){
          $scope.currentActivity.activity_types.push(at.tag);
        }
      });
      //console.log(JSON.stringify($scope.currentActivity.activity_types));

      //Update the ActivityGroups
      populateAGs();
    }else{
      $scope.currentActivity.product_groups = [];
      $.each($scope.currProductGroupList, function(k,v)
      {
        var pg = $scope.currProductGroupList[k];

        if (pg.selected){
          $scope.currentActivity.product_groups.push(pg.tag);
        }
      });
      //console.log(JSON.stringify($scope.currentActivity.product_groups));
    }

	};

	var removeARfromList = function(arId){
    //Find the activity index
    var itmId=null;
    $scope.data.items.some(function(item,index){
      if (item.id==arId){
        itmId=index;
        return true;
      }
      return false;
    });
    if(itmId!=null){
      //Remove the Old Item
      $scope.data.items.splice(itmId,1);
    }else{
      console.log('arId:'+ arId + ' not found in data.items' + ' ' + new Date().toUTCString());
    }
    itmId=null;
    //activitiesByGdeNameTemp[$scope.name]
    $scope.activitiesByGdeNameTemp[$scope.name]['activities'].some(function(item,index){
      if (item.id==arId){
        itmId=index;
        return true;
      }
      return false;
    });
    if(itmId!=null){
      //Remove the Old Item
      $scope.activitiesByGdeNameTemp[$scope.name]['activities'].splice(itmId,1);
    }else{
      console.log('arId:'+ arId + ' not found in activitiesByGdeNameTemp' + ' ' + new Date().toUTCString());
    }
    itmId=null;
    $scope.userActivities.some(function(item,index){
      if (item.id==arId){
        itmId=index;
        return true;
      }
      return false;
    });
    if(itmId!=null){
      //Remove the Old Item
      $scope.userActivities.splice(itmId,1);
    }else{
      console.log('arId:'+ arId + ' not found in userActivities' + ' ' + new Date().toUTCString());
    }
	};

	$scope.saveGDEActivity = function(senderEvent){

    var readyToSave = true;

    if ($("#fabDone").attr("disabled")){
      return; //If the fab button is disabled, skip everything; the ng-click is fired even if the fab is disabled
    }

    $("#fabDone").attr("disabled",true);//Disable the Fab to Avoid multiple click and save

    //Update Date variables to avoid Insert/Update errors
    var post_date = $rootScope.utils.verifyDateStringFormat($scope.currPost_dateLocale);
    if (post_date!='Invalid Date'){
      //store the date
      $scope.currentActivity.post_date = post_date;
    }else{
      alert('Invalid Activity Date format, please use YYYY-MM-DD');
      readyToSave=false;
    }

    //Validate numeric Fields
    //Sanity Checks on Numbers
    if ($scope.currentActivity.plus_oners==null || $scope.currentActivity.plus_oners==""){
      $scope.currentActivity.plus_oners=0;
    }else{
      if ($.isNumeric($scope.currentActivity.plus_oners)){
        $scope.currentActivity.plus_oners=parseInt($scope.currentActivity.plus_oners);
      }else{
        alert('Invalid +1s, please use an integer number');
        readyToSave=false;
      }
    }

    //Sanity Checks on Numbers
    if ($scope.currentActivity.resharers==null || $scope.currentActivity.resharers==""){
      $scope.currentActivity.resharers=0;
    }else{
      if ($.isNumeric($scope.currentActivity.resharers)){
        $scope.currentActivity.resharers=parseInt($scope.currentActivity.resharers);
      }else{
        alert('Invalid Resharers, please use an integer number');
        readyToSave=false;
      }
    }
    
    //Sanity Checks on Numbers
    if ($scope.currentActivity.comments==null || $scope.currentActivity.comments==""){
      $scope.currentActivity.comments=0;
    }else{
      if ($.isNumeric($scope.currentActivity.comments)){
       
        
        $scope.currentActivity.comments=parseInt($scope.currentActivity.comments);
      }else{
        alert('Invalid Comments, please use an integer number');
        readyToSave=false;
      }
    }

    $scope.metadataArray.forEach(function(currMeta){
      if ($scope.getAGFieldTitle(currMeta.activity_group,'impact').length>0){
        //Sanity Checks on Numbers
        if (currMeta.impact==null || currMeta.impact==""){
          currMeta.impact=0;
        }else{
          if ($.isNumeric(currMeta.impact)){
            currMeta.impact=parseInt(currMeta.impact);
          }else{
            alert('Invalid impact, please use an integer number');
            readyToSave=false;
          }
        }
      }

      if($scope.getAGFieldTitle(currMeta.activity_group,'us_approx_amount').length>0){
        //Sanity Checks on Numbers
        if (currMeta.us_approx_amount==null || currMeta.us_approx_amount==""){
          currMeta.us_approx_amount=null;
        }else{
          if ($.isNumeric(currMeta.us_approx_amount)){
            currMeta.us_approx_amount=parseFloat(currMeta.us_approx_amount);
          }else{
            alert('Invalid us_approx_amount, please use numeric characters');
            readyToSave=false;
          }
        }
      }
    });

    //Continue only if everything is OK
    if (readyToSave)
    {
      if ($scope.editMode=='Merge'){
        $("#fabDone").attr("disabled",false);//Enable the Fab again
        $scope.parentEvent=senderEvent;
        //ask confirmation to delete the original activities
        toggleDialog("mergeSaveDialog");
        return;
      }
      $scope.currentActivity.metadata = $scope.metadataArray;
      $scope.currentActivity.gde_name = $rootScope.userName;

      //Clear data_created and updated that are calculated on the backend
      $scope.currentActivity.date_updated =null;
      $scope.currentActivity.date_created = null;

      $scope.gdeTrackingAPI.activity_record.insert($scope.currentActivity).execute(
        function(response)
        {
          if (response.code){
            console.log('gdeTrackingAPI.activity_record.insert(DATA) responded with Response Code: '+response.code + ' - '+ response.message + ' ' + new Date().toUTCString());
            console.log(JSON.stringify($scope.currentActivity));
            alert(response.message);
          }else{
            //Delete the activity from the local arrays if in edit
            switch($scope.editMode){
              case 'Edit':
                if ($scope.data.items.length==1){
                    //only one item, re init all the arrays
                    $scope.data.items=[];
                    $scope.activitiesByGdeNameTemp[$scope.name]['activities']=[];
                    $scope.userActivities=[];
                }else{
                  removeARfromList(response.id);
                }
                break;
              case 'Merged':
                //User confirmed deletion of the original activities
                //Delete the "original" activities
                $scope.originalARToMerge.forEach(function(arItem){
                  //Remove the AR from the backend
                  $scope.gdeTrackingAPI.activity_record.delete({id:arItem.id}).execute(
                    function(resp){
                      if (resp.code){
                        console.log('gdeTrackingAPI.activity_record.delete({id:'+arItem.id+'}) responded with Response Code: '+resp.code + ' - '+ resp.message + ' ' + new Date().toUTCString());
                        console.log(JSON.stringify(arItem));
                        alert(resp.message);
                      }else{
                        //AR Deleted, remove from the table
                        removeARfromList(resp.id);
                        //Apply and refresh
                        $scope.$apply();
                      }
                  });
                });
                $scope.originalARToMerge = [];

                //disable the merge button
                $("#mergeButton").removeClass();
                $("#mergeButton").attr("disabled",true); //Disable the button

                break;
            }

            //Update the local Array
            $scope.data.items.push(response);

            //Apply and refresh Charts
            $scope.$apply();
            prepareActivitiesForChart();

            //Hide the dialog
            senderEvent.target.closest("#singleActivity").toggle();

          }

    		}
    	);
    }else{
      //Reenable the FAB
      $("#fabDone").attr("disabled",false);//Enable the Fab again
    }
	};

	$scope.checkMergeEnable = function(currVal){
    var tmp = $.grep($scope.userActivities,function(item){
      return (item.selectedForMerge != null && item.selectedForMerge==true)
    });
    $("#mergeButton").removeClass();
    $("#mergeButton").attr("disabled",true); //Disable the button
    if (currVal==null || currVal == false){
      if (tmp.length>0)//The event is rised before the data is changed so we have to check that
      {//Enable the merge button
        $("#mergeButton").attr("disabled",false);
        $("#mergeButton").addClass("colored blue");
      }
    }else{
      if(tmp.length>2){//3 or more selected, one less selecting, still more (or equal) then 2
        //Enable the merge button
        $("#mergeButton").attr("disabled",false);
        $("#mergeButton").addClass("colored blue");
      }
    }

	};

  $scope.originalARToMerge = [];

  $scope.askMergeConfirmation = function(){
    //Clean the array of AR that will be merged
    $scope.originalARToMerge = [];
    //Show the dialog to confirm merging
    toggleDialog("mergeDialog");
  };

	$scope.mergeSelectedAR = function(senderEvent){
    //Hide the dialog
    //toggleDialog("mergeDialog");
    senderEvent.target.closest("#mergeDialog").toggle();

    //Create a new Empty AR
    $scope.newActivity(false);

    //Loop over the selected ARs
    var tmp = $.grep($scope.userActivities,function(item){
      return (item.selectedForMerge != null && item.selectedForMerge==true)
    });

    var mergedActivity = $scope.currentActivity;
    mergedActivity.metadata = [];
    mergedActivity.gplus_posts = [];

    tmp.forEach(function(tmpItem){
      var item = $.grep($scope.data.items, function(arItem){
        return arItem.id== tmpItem.activity_id;
      })[0];
      //Keep track of the original activities that will be merged for future use
      $scope.originalARToMerge.push(item);
      //Create the merged "default" activity
      //Concatenate the Activity Title to the current
      if (mergedActivity.activity_title==null){
        mergedActivity.activity_title= '';
      }
      mergedActivity.activity_title += (item.activity_title || '');
      //Set activity date IF mergedActivity.post_date == null || mergedActivity.post_date>item.post_date
      if(mergedActivity.post_date==null || mergedActivity.post_date>item.post_date){
        mergedActivity.post_date=item.post_date;
      }
      //Sum +1s,reshares,comments
      mergedActivity.plus_oners += (item.plus_oners||0);
      mergedActivity.resharers += (item.resharers||0);
      mergedActivity.comments += (item.comments||0);

      //Overwrite the activity Link
      mergedActivity.activity_link = (item.activity_link || '');
      //Merge the gplus_posts
      if (item.gplus_posts != null && item.gplus_posts.length>0){
        mergedActivity.gplus_posts=mergedActivity.gplus_posts.concat(item.gplus_posts);
      }

      //Update the activity Types of the merged record
      if(item.activity_types!=null){
        item.activity_types.forEach(function(at){
          if(mergedActivity.activity_types.indexOf(at)<0){
            mergedActivity.activity_types.push(at);
          }
        });
      }
      //Update the product groups of the merged record
      if(item.product_groups!=null){
        item.product_groups.forEach(function(pg){
          if(mergedActivity.product_groups.indexOf(pg)<0){
            mergedActivity.product_groups.push(pg);
          }
        });
      }

      //Loop over the activity metadata objects
      if(item.metadata!=null){
        item.metadata.forEach(function(metaObj){
          var addNewMeta = true;
          //Search if the activity group is already in the mergedObject
          mergedActivity.metadata.some(function(mergedMeta){

            if(metaObj.activity_group==mergedMeta.activity_group){
              addNewMeta = false;
              //Meta group found, merge the values that makes sense and replace the other if the current metadata is not empty (or null)
              if (metaObj.title!=null && metaObj.title!='')
              {
                mergedMeta.title= metaObj.title;
              }
              if (metaObj.description!=null && metaObj.description!='')
              {
                mergedMeta.description= metaObj.description;
              }
              //Set the meta.type to the first available
              if(mergedMeta.type == null || mergedMeta.type==''){
                mergedMeta.type = metaObj.type
              }
              //Store max 3 links
              if (metaObj.link!=null && metaObj.link!='')
              {
                if (mergedMeta.link != null && mergedMeta.link!=metaObj.link){
                  if (mergedMeta.other_link1 != null && mergedMeta.other_link1!=metaObj.link){
                    if (mergedMeta.other_link2 == null){
                      mergedMeta.other_link2= (metaObj.link || '');
                    }
                  }else{
                    mergedMeta.other_link1= (metaObj.link|| '');
                  }
                }else{
                  mergedMeta.link= (metaObj.link || '');
                }
              }
              if (metaObj.other_link1!=null && metaObj.other_link1!='')
              {
                if (mergedMeta.other_link1 != null && mergedMeta.other_link1!=metaObj.link){
                  if (mergedMeta.other_link2 == null){
                    mergedMeta.other_link2= (metaObj.link || '');
                  }
                }else{
                  mergedMeta.other_link1= (metaObj.link|| '');
                }
              }
              //mergedMeta.other_link2= (metaObj.other_link2|| '');
              if (metaObj.other_link2!=null && metaObj.other_link2!='')
              {
                mergedMeta.other_link2= (metaObj.other_link2|| '');
              }
              mergedMeta.impact+= (metaObj.impact || 0);
              if (metaObj.location!=null && metaObj.location!='')
              {
                mergedMeta.location= metaObj.location;
              }
              //mergedMeta.google_expensed= metaObj.google_expensed;
              if (metaObj.google_expensed!=null && metaObj.google_expensed==true)
              {
                mergedMeta.google_expensed= true;
              }

              if (mergedMeta.google_expensed==true)
              {
                mergedMeta.us_approx_amount+= (metaObj.us_approx_amount ||0);
              }

              //Exit the loop
              return true;
            }else{
              return false;
            }
          });
          if (addNewMeta){
            //New AG, push the metadata
            mergedActivity.metadata.push(metaObj);
          }
        });
      }
    });
    $scope.metadataArray= mergedActivity.metadata;
    $scope.currentActivity = mergedActivity;
    //merging complete
    //Populate Product Groups and Activities for the selection table
    populatePGs();
    populateATs();
    populateAGs();//Populate the ActivityGroups

    $scope.currDate_updatedLocale = $rootScope.utils.dateToCommonString(new Date($scope.currentActivity.date_updated));
    $scope.currDate_createdLocale = $rootScope.utils.dateToCommonString(new Date($scope.currentActivity.date_created));
    $scope.currPost_dateLocale = $rootScope.utils.dateToCommonString(new Date($scope.currentActivity.post_date));

    $scope.editMode ="Merge";
    //Load ActivityPost Items for the current ActivityRecord
    getActivityPosts($scope.currentActivity);

    $("#fabDone").attr("disabled",false);//Enable the save button
    //Display the single Activity Dialog
    toggleDialog('singleActivity');

	};

  $scope.saveMergedAR = function(senderEvent){
    //toggleDialog("mergeSaveDialog");
    senderEvent.target.closest("#mergeSaveDialog").toggle();
    //Set the EditMode to Merged
    $scope.editMode='Merged';
    //Save the activity
    $scope.saveGDEActivity($scope.parentEvent);

  };
  //Metadata functions
  $scope.selectAG = function(agId,senderEvent){
    $.each($scope.currActivityGroups, function(k,v)
    {
      var ag = $scope.currActivityGroups[k];
      if(agId==ag.tag){
        $scope.selectAGIdx=k;
        $scope.selectedAG=ag;
        //MSO - 2015-03-29 - get the reference to the core animated pages inside the context of the dialog
        var pages= senderEvent.target.parentElement.parentElement.querySelector("#core_animated_pages");
        pages.selected = k;//Select the right page for the tab
      }
		});
  };

  $scope.updateAG = function(agId){
    var createNew=true;
    //Check if in the metadataArray is present the
    $scope.metadataArray.some(function(item){
      if(item.activity_group==agId){
        //Activity Group found
        createNew=false;

        //Exit the loop
        return true;
      }
      return false;
    });

    if (createNew) {
      //Create a new metadata object for the current activity_group
      var meta = {};
      meta.activity_group=agId;
      $scope.metadataArray.push(meta);
      if($scope.metadataArray.length>1){
        //Reorder the array
        $scope.metadataArray =
          $scope.metadataArray.sort(function(a,b){
              var A = a.activity_group.toLowerCase();
              var B = b.activity_group.toLowerCase();
              if (A < B){
                return -1;
              }else if (A > B){
                return  1;
              }else{
                return 0;
              }
            });
      }
    }
  };

  $scope.isUsedInMetadata = function(category,field){
    var toRet=false;

    $scope.currActivityGroups.some(function(item){
      if(item.tag==category){
        //Label of the field is null or empty
        if(item[field]==null ||item[field]==''){
          toRet=false;
        }else{
          toRet=true;
        }
        return true;
      }else{
        return false;
      }
    });

    return toRet;
  };

  $scope.getAGFieldTitle = function(category,field){
    var toRet=field;

    $scope.currActivityGroups.some(function(item){
      if(item.tag==category){
        toRet = item[field];
        return true;
      }else{
        return false;
      }
    });

    return toRet;
  };

  $scope.enableLinkEdit = function(){
    $scope.currActLink = null;
  };

});
