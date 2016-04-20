/* eslint max-nested-callbacks: 0 */
/* global describe, it, beforeEach, after*/

const Firebase = require('firebase')

const fb = new Firebase(process.env.BUILD_FIREBASE_HOST.trim())

fb.authWithCustomToken(process.env.FIREBASE_TOKEN.trim(), (err, auth) => {
  if (err) {
    console.log('FB auth err:',err); process.exit()
  } else {
    console.log('FB authed successfully')
  }
})

const profiles = fb.child('Profiles')

if (!process.env.TEST_ACCOUNT_EMAIL || !process.env.TEST_ACCOUNT_PASSWD) {
  console.log('Need TEST_ACCOUNT_EMAIL and TEST_ACCOUNT_PASSWD env var')
  process.exit()
}

const ACCOUNT = {
  EMAIL: process.env.TEST_ACCOUNT_EMAIL.trim(),
  PASSWD: process.env.TEST_ACCOUNT_PASSWD.trim(),
}

function login(client) {
  return client
    .url('http://localhost:8080')
    .click('i.icon-more_vert')
    .click('div.title')
    .window_handles((result) => {
      client.switchWindow(result.value[1])
        .waitForElementVisible('#Email', 3000)
        .setValue('#Email', ACCOUNT.EMAIL)
        .click('#next')
        .waitForElementVisible('#Passwd', 3000)
        .setValue('#Passwd', ACCOUNT.PASSWD)
        .click('#signIn')
    })
    .window_handles((result) => {
      client.switchWindow(result.value[0])
    })
}

describe('First login', () => {
  it('shows confirm page on first login', (client) => {
    login(client)
      .assert.value('.cycle-scope-fullName input', 'Test User')
      .assert.value('.cycle-scope-email input', ACCOUNT.EMAIL)
  })

  it('should allow for entering phone number and confirming', (client) => {
    client
      .waitForElementVisible('.cycle-scope-phone')
      .setValue('.cycle-scope-phone input', '555-555-5555')
    client.assert.value('.cycle-scope-phone input', '555-555-5555')
  })
})

describe('Second login', () => {
  it('should bring the user directly to the dash', (client) => {
    login(client)

    client.assert.urlContains('/dash')
  })
})
