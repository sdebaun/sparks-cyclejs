import {Observable} from 'rx'
import {events} from 'snabbdom-material'

const isMobile$ = () => {
  let screenInfo$ =
    Observable.create(obs => {
      events.responsive.addListener(screenInfo => {
        obs.onNext(screenInfo)
      })
    }).map(si => si.size <= 2).replay(null, 1)

  const disposable = screenInfo$.connect()

  screenInfo$.dispose = () => disposable.dispose()
  return screenInfo$
}

export {isMobile$}
