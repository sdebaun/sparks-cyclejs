# Sparks.Network / Frontend

This repo contains the front end application for [The Sparks.Network](http://www.sparks.network).

The backend can be found at: [sparks-backend](http://github.com/sdebaun/sparks-backend).

## Overview

The Sparks.Network is a new platform that engages volunteers with the people who need them.

We're not just a volunteer management app, and we're not just a craigslist for volunteers.  We're solving volunteering in the same way that Uber, Airbnb, and other sharing economy apps: by connecting those that have, with those that need, and giving them the tools to work together.

### Contributions

Development is driven by in-house developers at the Sparks.Network.  Public participation (up to and including pull requests) are welcome.  We are investigating ways to reward outside contributions to the code with both cash and equity.  Please email [Steve DeBaun](mailto://sdebaun@sparks.network) with suggestions!

## Dependencies

We are currently using:

* The amazing [Cycle.js](http://cycle.js.org/) library to turn the entire application into one big function, along with [cyclic-history](https://github.com/TylorS/cyclic-history) and [cyclic-router](https://github.com/TylorS/cyclic-router).

* [Snabbdom](https://github.com/paldepind/snabbdom) for virtual tree/DOM generation, along with [Snabbdom-material](https://github.com/garth/snabbdom-material) to get us quickly using a Material theme.

* A couple of components from the [React](https://facebook.github.io/react/) ecosystem: [react-dropzone](https://github.com/okonet/react-dropzone) and [react-cropper](https://github.com/roadmanfong/react-cropper).  They are incorporated into the cyclejs loop via snabbdom render hooks.

* [Firebase](http://www.firebase.com) is our BaaS data source, wrapped in our own simple driver.

* [Babel](https://babeljs.io/) with stage-0 to transpile ES6

* [Webpack](https://github.com/webpack/webpack) and several glorious loaders to handle packaging the application

## Installing

From the command line:

`git clone https://github.com/sdebaun/sparks-cyclejs && cd sparks-cyclejs && npm run start`

## Usage

### Development

You can start a local server at `http://localhost:8080` for your application with `npm run serve`. It uses [Webpack](https://webpack.github.io/) and provides live reloading (not hot reload) out of the box.

### Production

Build a production ready version of your app into `dist/bundle.js` using `npm run build`.

## License

MIT
