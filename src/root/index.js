import {Observable} from 'rx'
import isolate from '@cycle/isolate'

import Landing from './Landing'
import Dash from './Dash'
import Admin from './Admin'
import Project from './Project'

import {nestedComponent} from 'helpers/router'

import './styles.scss'

// Route definitions at this level
const routes = {
  '/': Landing,
  '/dash': isolate(Dash),
  '/admin': isolate(Admin),
  '/project/:key': key => sources => Project({
    project$: sources.firebase('Projects',key),
    ...sources,
  }),
}

const _routes = {
  '/:projectKey': projectKey => sources => Dash({
    project$: sources.firebase('Projects',projectKey),
    ...sources,
  }),
}

export default sources => {
  const responses$ = sources.auth$
    .flatMapLatest(auth => auth ? sources.queue$(auth.uid) : Observable.empty())

  responses$.subscribe(x => console.log('queue response:',x))

  const userProfileKey$ = sources.auth$
    .flatMapLatest(auth =>
      auth ? sources.firebase('Users',auth.uid) : Observable.empty()
    )

  const userProfile$ = userProfileKey$
    .flatMapLatest(key =>
      key ? sources.firebase('Profiles',key) : Observable.empty()
    )

  const page$ = nestedComponent(sources.router.define(routes),{
    responses$,
    userProfile$, userProfileKey$,
    ...sources,
  })

  return {
    DOM: page$.flatMapLatest(({DOM}) => DOM),
    auth$: page$.flatMapLatest(({auth$}) => auth$ || Observable.never()),
    queue$: page$.flatMapLatest(({queue$}) => queue$ || Observable.never()),
    router: page$.flatMapLatest(({route$}) => route$ || Observable.never()),
  }
}
