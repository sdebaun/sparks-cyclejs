# Sparks.Network / Frontend

This repo contains the front end application for [The Sparks.Network](http://www.sparks.network).

The backend can be found at: [sparks-backend](http://github.com/sdebaun/sparks-backend).

## Overview

The Sparks.Network is a new platform that engages volunteers with the people who need them.

We're not just a volunteer management app, and we're not just a craigslist for volunteers.  We're solving volunteering in the same way that Uber, Airbnb, and other sharing economy apps: by connecting those that have, with those that need, and giving them the tools to work together.

### Ethos

Volunterism is a fundamental part of our company ethos, and open source is just another expression of that.  As we continue to develop this application, we are constantly looking for ways to extract things into more reusable libraries that we can give back to the community.  If you see anything like that in the code, open an issue and let us know!

### Contributions

Development is driven by in-house developers at the Sparks.Network.  Public participation (up to and including pull requests) are welcome.  We are investigating ways to reward outside contributions to the code with both cash and equity.  Please email [Steve DeBaun](mailto://sdebaun@sparks.network) with suggestions!

### Team

Yes, we are hiring!  The Sparks.Network is a startup with seed funding that is making the world a better place.  We are currently hiring part- or full-time developers.  [Want to know more?](https://docs.google.com/document/d/19hnV0jEbEeFGPfOgU_zQmjahdM44RAAFPzPX7fDlkE4)

## Dependencies

We are currently using:

* The amazing [Cycle.js](http://cycle.js.org/) library to turn the entire application into one big function, along with [cyclic-history](https://github.com/TylorS/cyclic-history) and [cyclic-router](https://github.com/TylorS/cyclic-router).

* [Snabbdom](https://github.com/paldepind/snabbdom) for virtual tree/DOM generation, along with [Snabbdom-material](https://github.com/garth/snabbdom-material) to get us quickly using a Material theme.

* A couple of components from the [React](https://facebook.github.io/react/) ecosystem: [react-dropzone](https://github.com/okonet/react-dropzone) and [react-cropper](https://github.com/roadmanfong/react-cropper).  They are incorporated into the cyclejs loop via snabbdom render hooks.

* [Firebase](http://www.firebase.com) is our BaaS data source, wrapped in our own simple driver.

* [Babel](https://babeljs.io/) with stage-0 to transpile ES6

* [Webpack](https://github.com/webpack/webpack) and several glorious loaders to handle packaging the application

* [Gulp](https://github.com/gulpjs/gulp) for development, build, and deployment automation.

* This project was started with the [cyclejs-starter](https://github.com/andreloureiro/cyclejs-starter) boilerplate.

## Installing

From the command line:

`git clone https://github.com/sdebaun/sparks-cyclejs && cd sparks-cyclejs && npm run start`

## Services

We're using several services to manage deployment:

* `github` obviously.

* [CircleCI](https://circleci.com) is configured to test all commits to all branches in the repository.  It also has two automagic deployments:

** `release` branch is deployed to `staging` server

** `master` branch is deployed to `production` server

* [surge.sh](http://surge.sh) is serving up both of those servers.

## Usage

### Credentials

All credentials are stored in the services that use them.  Currently that consists of SURGE_NAME and SURGE_TOKEN, stored in CircleCI; they let the `gulp deploy` task do its magic.

### Gulp Commands

`gulp serve`: run a local webpack development server at `http://localhost:8080`

`gulp build`: use webpack to compile into dist/

`gulp deploy --domain <domain>`: use [surge.sh](http://surge.sh) to deploy to the specified host.

## Internals

TODO: Describe use of firebase, auth$, queue$, router, DOM drivers

## License

MIT
