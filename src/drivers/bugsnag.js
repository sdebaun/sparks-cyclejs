import Bugsnag from 'Bugsnag'

const makeBugsnagDriver = options => {
  if (Bugsnag._u) {
    return function nullDriver(input$) {
      input$.subscribe(() => {})
      return {}
    }
  }

  Bugsnag.releaseStage = options.releaseStage

  const actions = {
    refresh: () => Bugsnag.refresh(),
    user: action => { Bugsnag.user = action.user },
    notify: action => {
      if (action.user) {
        Bugsnag.user = action.user
      }
      if (action.metaData) {
        Bugsnag.metaData = action.metaData
      }

      Bugsnag.notify(action.error)
    },
  }

  return function bugsnagDriver(input$) {
    input$.subscribe(payload => {
      if (payload.action) {
        actions[payload.action](payload)
      } else {
        actions.notify({error: payload})
      }
    })

    return Bugsnag
  }
}

export default makeBugsnagDriver
