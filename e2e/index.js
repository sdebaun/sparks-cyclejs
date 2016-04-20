/* eslint max-nested-callbacks: 0 */
/* global describe, it, beforeEach, after*/

if (!process.env.TEST_ACCOUNT_EMAIL || !process.env.TEST_ACCOUNT_PASSWD) {
  console.log('Need TEST_ACCOUNT_EMAIL and TEST_ACCOUNT_PASSWD env var')
  process.exit()
}

const ACCOUNT = {
  EMAIL: process.env.TEST_ACCOUNT_EMAIL.trim(),
  PASSWD: process.env.TEST_ACCOUNT_PASSWD.trim(),
}

describe('Nightwatch integration testing', () => {
  after((client, done) => {
    client.end(() => {
      done()
    })
  })

  it('shows confirm page on first login', (client) => {
    client
      .url('http://localhost:8080')
      .click('i.icon-more_vert')
      .click('.cycle-scope-google .title')
      .pause(1000)
      .window_handles((result) => {
        client.switchWindow(result.value[1])
          .waitForElementVisible('#Email', 10000)
          .setValue('#Email', ACCOUNT.EMAIL)
          .click('#next')
          .waitForElementVisible('#Passwd', 10000)
          .setValue('#Passwd', ACCOUNT.PASSWD)
          .click('#signIn')
      })
      .window_handles((result) => {
        client.switchWindow(result.value[0])
          .pause(1000)
      })

    client.getLog('browser', result => console.log('BROWSER LOG:', result))
    client.assert.value('.cycle-scope-fullName input', 'Test User')
    client.assert.value('.cycle-scope-email input', ACCOUNT.EMAIL)
  })

  it('should allow for entering phone number, confirming, redirecting to dash', (client) => {
    client.setValue('.cycle-scope-phone input', '555-555-5555')
      .waitForElementVisible('.submit')
      .click('.submit')
      .assert.urlContains('/dash')
  })
})
