import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

// import isolate from '@cycle/isolate'

// import {log} from 'util'

// import AppBar from 'components/AppBar'

import {div} from 'cycle-snabbdom'

import SoloFrame from 'components/SoloFrame'

// import {log} from 'util'

import {Organizers} from 'components/remote'

export default sources => {
  const organizer$ = sources.organizerKey$
    .flatMapLatest(Organizers.query.one(sources))

  // const queue$ = profile$
  //   .sample(submit$)
  //   .map(Profiles.create)

  const viewState = {
    organizer$,
    // auth$: sources.auth$,
    // userProfile$: sources.userProfile$,
    // profileFormDOM$: profileForm.DOM,
  }

  const pageDOM = combineLatestObj(viewState)
    .map(({organizer}) =>
      div({},[organizer.inviteEmail])
    )

  const frame = SoloFrame({pageDOM, ...sources})

  const route$ = Observable.merge(
    frame.route$,
  )

  return {
    DOM: frame.DOM,
    route$,
    auth$: frame.auth$,
    // queue$,
  }
}
