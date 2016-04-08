describe('Nightwatch integration testing', function() {
  after(function(client, done) {
    client.end(function() {
      done()
    })
  })
  beforeEach(function(client, done) {
    client
      .url('http://localhost:8080')
      .click('i.icon-more_vert')
      .click('div.title')
      .window_handles((result) => {
        client.switchWindow(result.value[1])
          .setValue('#Email', 'test@sparks.network')
          .click('#next')
          .pause(500)
          .setValue('#Passwd', 'sparks4life')
          .click('#signIn')
        })
      .window_handles(function(result) {
        client.switchWindow(result.value[0])
          .pause(2500)
        })
    done()
  })
  it('shows dash after login', function(client) {
    client.assert.containsText('.title', 'Test User')
  })
})