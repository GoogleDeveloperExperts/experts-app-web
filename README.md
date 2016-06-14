# GDE Tracking minimal viable product, Progressive Web App edition

A Progressive Web App built with Polymer.

## What?

[Version 2.0.0 Requirements](https://docs.google.com/document/d/1bZIIR9yUOMI8dZzmPRyIGVPUO9Ov85Xq31FWbpRHnHQ/edit)

### Setup

##### Prerequisites

You need NodeJS and NPM installed.

https://nodejs.org/en/download/

Run the following commands from you console.

    npm install -g polymer-cli
    bower install

##### New to Polymer progressive web apps?

This MVP uses the [Polymer App Toolbox](https://www.polymer-project.org/1.0/toolbox/) introduced in Google I/O 2016.

This tutorial  will familiarize you with all the technology on this project.

https://www.polymer-project.org/1.0/start/toolbox/set-up

### Start the development server

This command serves the app at `http://localhost:8080` and provides basic URL
routing for the app:

    polymer serve

### Build for production

This command performs HTML, CSS, and JS minification on the application
dependencies, and generates a service-worker.js file with code to pre-cache the
dependencies based on the entrypoint and fragments specified in `polymer.json`.

    polymer build