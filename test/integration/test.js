describe('Nightwatch integration testing', function() {
  before(function(client, done) {
    done()
  })
  after(function(client, done) {
    client.end(function() {
      done()
    })
  })
  afterEach(function(client, done) {
    done()
  })
  beforeEach(function(client, done) {
    done()
  })
  it('shows dash after login', function(client) {
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
          .assert.containsText('.title', 'Test User')
        })
      })
})