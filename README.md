# gde-app-web
Simple static app engine repository for push to deploy of the GDE Tracking App

**This Branch is the current prod version of the web app using angularJS + Polymer 0.5.6 elements.**

**Current Dev version is in the master branch**

###### Start local server
-------------------------

To start local server run the following command and visit [localhost:8080](http://localhost:8080/) in your browser.

```
node server.js
```

###### Vulcanize files
----------------------

First install Vulcanize, this version of Polymer requires vulcanize 0.7.x.

```
npm install -g vulcanize@0.7.10
```

Once installed go to `/public` folder and run:

```
vulcanize app.html -o index.html
```
