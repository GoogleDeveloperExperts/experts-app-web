// *****************************************************************************************************
//    								paper-fab Controller
// *****************************************************************************************************
GdeTrackingApp.controller("fabCtrl",							function($scope,	$location)
{
	$('paper-fab')	.click( function()			// Triggers Animation on paper-fab click
	{
		if ($('paper-fab')	.attr('id')	== 'fabLeft')			// Cycle between left and right animation
		{
//			console.log('left');
			$('.mapArea')		.css('-webkit-animation'	, 'mapSlideLeft		1s	linear	1	both');	//	-webkit- CSS3 animation
			$('.mapArea')		.css('animation'			, 'mapSlideLeft		1s	linear	1	both');	//	W3C	CSS3 animation
			$('paper-fab')		.css('-webkit-animation'	, 'fabGoesLeft		0.5s	linear	1	both');	//	-webkit- CSS3 animation
			$('paper-fab')		.css('animation'			, 'fabGoesLeft		0.5s	linear	1	both');	//	W3C	CSS3 animation
			$('paper-fab')		.attr('id','fabRight');		//	Updates the element's id
			setTimeout(function()	//	Show GDE List
				{
					$('.gdeList')	.css('opacity' , '1');
					$('.scrollBar')	.css('display' , 'inline');
					$('.scrollBar')	.css('overflow-y' , 'auto');
				},
				1010				//	Wait 1 second before showing
			);
		}	else if ($('paper-fab')	.attr('id')	== 'fabRight')
		{
//			console.log('right');
			$('.gdeList')		.css('opacity' 				, '0');
			$('.scrollBar')		.css('overflow-y' 			, 'hidden');
			$('.scrollBar')		.css('display' 				, 'block');								//	Hice GDE List
			$('.mapArea')		.css('-webkit-animation'	, 'mapSlideRight	1s	linear	1	both');	//	-webkit- CSS3 animation
			$('.mapArea')		.css('animation'			, 'mapSlideRight	1s	linear	1	both');	//	W3C	CSS3 animation
			$('paper-fab')		.css('-webkit-animation'	, 'fabGoesRight		0.5s	linear	1	both');	//	-webkit- CSS3 animation
			$('paper-fab')		.css('animation'			, 'fabGoesRight		0.5s	linear	1	both');	//	W3C	CSS3 animation
			$('paper-fab')		.attr('id','fabLeft');		//	Updates the element's id
		};
	});
});