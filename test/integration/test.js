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
      .click('div.title')
      .window_handles((result) => {
        client.switchWindow(result.value[1])
          .setValue('#Email', 'test@sparks.network')
          .click('#next')
          .waitForElementVisible('#Passwd', 1000)
          .setValue('#Passwd', 'sparks4life')
          .click('#signIn')
      })
      .window_handles((result) => {
        client.switchWindow(result.value[0])
          .pause(2500)
      })
    done()
  })
  it('shows dash after login', (client) => {
    client.assert.containsText('.title', 'Test User')
  })
})