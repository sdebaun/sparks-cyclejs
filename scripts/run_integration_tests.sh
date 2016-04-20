#!/bin/bash
export BUILD_FIREBASE_HOST=https://sparks-circleci.firebaseio.com
export MOCHA_FILE=./tests_output/test-results.xml
export TEST_ACCOUNT_EMAIL=test@sparks.network
export TEST_ACCOUNT_PASSWD=sparks4life

bash ./scripts/build_backend.sh
node ./scripts/delete_firebase_data.js &
npm run build

bash ./scripts/run_backend.sh & npm run serve-static &
sleep 3
npm test -- --env circleci
