# GDE Tracking minimal viable product, Progressive Web App edition

A Progressive Web App built with Polymer.

## What?

[Version 2.0.0 Requirements](https://docs.google.com/document/d/1bZIIR9yUOMI8dZzmPRyIGVPUO9Ov85Xq31FWbpRHnHQ/edit)

## How?

This MVP uses the [Polymer App Toolbox](https://www.polymer-project.org/1.0/toolbox/) introduzed in Google I/O 2016. Take with a grain of salt (or two), apply code as needed.

* [What are progressive web apps?](https://developers.google.com/web/progressive-web-apps?hl=en)
* [Build an app with App Toolbox](https://www.polymer-project.org/1.0/start/toolbox/set-up)
* [Case study: the Shop ](https://www.polymer-project.org/1.0/toolbox/case-study)
* [Shop demo](https://shop.polymer-project.org/)
* [Responsive app layout](https://www.polymer-project.org/1.0/toolbox/app-layout)

## Setup

This app requires the [Polymer CLI](https://www.polymer-project.org/1.0/start/toolbox/set-up).


### Install the Polymer CLI

1. Install the LTS version (4.x) of Node.js. The current version (6.x) should work, but is not officially supported. Versions below LTS are not supported.

1. Install the Polymer CLI

```
npm install -g polymer-cli
```


### Serve the project

You can serve the application using the Polymer CLI, and file changes you make will be immediately visible by refreshing your browser.

```
polymer serve --open
```

The task above automatically opens up your default web browser and fetches the locally-hosted application (at http://localhost:8080).