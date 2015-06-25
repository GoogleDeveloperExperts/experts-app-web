gde-app
=======

The GDE App is an application that aims to help Google Developer Experts track their activities and give Googlers a way to analize the most impactful activity types.


## Where is the code?

The application is mainly composed by 2 parts:
- Backend: Python code run on Google App Engine
- WebApp: AngularJs + Polymer web interface, with some Material Design components and style applied

The backend code can be found on the `feature/appengine` branch, the current version of the Web App can be found in the branch `feature\material_design`.

## Installing

First of all download the get the branch with Git.

**N.B.** As of 2014-10-17 the Front End Code on Git has harcoded keys and backend URLs, so remember to change those if you want to deploy your copy.

###Backend
*TODO: Fill with instructions*

###Web App
The Web App is all JS and HTML, so you can run it in any web server or, as in the production environment, drop the code inside a Google Drive folder shared "Public".

## Developing

Download the code with Git, and use your most loved editor.

bower is used to get the various web components

**N.B.** As of 2014-10-17 the Front End branch has all the polymer web components manually added and it's using polymer 0.3.3.

After the implementation of [issue 57](https://github.com/maiera/gde-app/issues/57) is done, we are going to use `bower` to keep components and libraries fresh

###Backend
*TODO: Fill with instructions*

###Web App
As stated before the Code is all JS and HTML, the application use Angular and Polymer, but the scripts and components are inside the Git branch.
Feel free the IDE you love most to work edit the source, [Chrome Dev Editor] (https://chrome.google.com/webstore/detail/chrome-dev-editor-develop/pnoffddplpippgcfjdhbmhkofpnaalpg) is used and endorsed by @Smokybob and works :D
[Bower](http://bower.io/) will be required in the near future to keep dependencies updated and avoid having them in git.
[Vulcanize](https://github.com/polymer/vulcanize) is not currently used but will be during future deployment in the "production" environment

Bower is already available in CDE, vulcanize require developer mode enabled on ChromeBooks and needs to be manually installed via shell (ping @Smokybob if needed TODO: gist for the manual install on ChromeBooks).

##Contributing

Want to Contribute? **Awesome!!!** and thanks.

###Ideas/Feature request/bugs
Use the Git issue tracker, please check if the feature already has a dedicated issue, and provide as much information, links, steps to implement the feature.

###Coding
We have no rules set in stone on how to contribute with code, but we agree on a couple of things:
- **Track the changes**: always have an issue in the issue tracker for the feature/bug before working on something, if you are working on it, assign yourself to it; this way other contributors knows someone is working on it and can work on something else
- **Fork it**: 99% of the changes should be done on forks, only small bug fixes (ex. typos) can be done directly in the main branch and quickly deployed.
- **Merging back**: When you are done implementing and testing on your fork, create a pull request with a reference to the issue/issues it's implementing; before merging the pull request, wait at least 24hrs if other collaborators want to take a look and comment; two sign of approval (Ex. Looks awesome, +1, etc..) from other active collaborators (people that have coded) means that the feature can be pulled instantly.
- **Publishing (web)**: Change the code of the file inside the [GDE Tracking App Prototype](https://drive.google.com/folderview?id=0B_RClkFMLkcpeDdNSHVmVXdTY0k&usp=sharing) Google Drive Folder, this can be acheived by using Google Drive Sync or by editing each file with one of the web text editor connected with Google Drive.
- **Publishing (GAE)**: *TODO:Add guidelines for publishing to GAE*
