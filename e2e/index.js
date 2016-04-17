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
  beforeEach((client, done) => {
    client
      .url('http://localhost:8080')
      .click('i.icon-more_vert')
      .click('.cycle-scope-facebook .title')
      .pause(3000)
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
          .pause(15000)
      })
    done()
  })
  it('shows confirm page on first login', (client) => {
    client.assert.value('.cycle-scope-fullName input', 'Test User')
    client.assert.value('.cycle-scope-email input', ACCOUNT.EMAIL)
  })
})