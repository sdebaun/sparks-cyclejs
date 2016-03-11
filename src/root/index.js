import {Observable} from 'rx'
import isolate from '@cycle/isolate'

import Landing from './Landing'
import Confirm from './Confirm'
import Dash from './Dash'
import Admin from './Admin'
import Project from './Project'

import 'normalize-css'
import '!style!css!snabbdom-material/lib/index.css'

import {nestedComponent} from 'util'

import {log} from 'util'

import './styles.scss'

const just = Observable.just

// Route definitions at this level
const routes = {
  '/': Landing,
  '/confirm': isolate(Confirm),
  '/dash': isolate(Dash),
  '/admin': isolate(Admin),
  // '/project/:key/foo': key => sources => isolate(Project)({
  //   project$: Observable.just({}), ...sources,
  // }),
  // '/project': sources => isolate(Project)({
  //   project$: Observable.just({}), ...sources,
  // }),
  // '/project/:key': key => sources => isolate(Project)({
  //   project$: sources.firebase('Projects',key),
  //   ...sources,
  // }),
  '/project/:key': key => sources =>
    isolate(Project)({projectKey$: just(key), ...sources}),
}

export default sources => {
  // get queue response stream based on auth'd uid
  const responses$ = sources.auth$
    .flatMapLatest(auth => auth ? sources.queue$(auth.uid) : Observable.empty())
    .pluck('val')
    .share()

  // lots of components like to know the user's profile key and profile info
  // let us make it easy for them
  const userProfileKey$ = sources.auth$
    .flatMapLatest(auth =>
      auth ? sources.firebase('Users', auth.uid) : Observable.just(null)
    )

  const userProfile$ = userProfileKey$
    .distinctUntilChanged()
    .flatMapLatest(key => {
      return key ? sources.firebase('Profiles', key) : Observable.just(null)
    })

  // sources.auth$.subscribe(log('auth$'))
  // userProfileKey$.subscribe(log('userProfileKey$'))
  // userProfile$.subscribe(log('userProfile$'))

  // these two redirects are passed on to child components
  // who simply plug them into their route$ sink
  // if they want this behavior
  const redirectLogin$ = userProfile$
    .filter(profile => !!profile)
    .map(profile => profile.isAdmin ? '/admin' : '/dash')

  const redirectLogout$ = sources.auth$
    .filter(profile => !profile)
    .map(() => '/')

  // this is the only global redirect
  // it always gets piped to the router
  const redirectUnconfirmed$ = userProfileKey$
    .withLatestFrom(sources.auth$)
    .filter(([profile,auth]) => !profile && !!auth)
    .map(() => '/confirm')

  const page$ = nestedComponent(sources.router.define(routes),{
    responses$, userProfileKey$, userProfile$, redirectLogin$, redirectLogout$,
    ...sources,
  })

  const authedActions$ = page$
    .flatMapLatest(({queue$}) => queue$ || Observable.never())
    .withLatestFrom(sources.auth$)
    // .do(log('authedAction$'))
    .map(([action,auth]) => ({uid: auth && auth.uid, ...action}))

  authedActions$.subscribe(log('authedActions$'))

  const router = page$
    .flatMapLatest(({route$}) => route$ || Observable.never())
    .merge(redirectUnconfirmed$)

  router.subscribe(log('router'))

  return {
    DOM: page$.flatMapLatest(({DOM}) => DOM),
    auth$: page$.flatMapLatest(({auth$}) => auth$ || Observable.never()),
    queue$: authedActions$,
    router,
  }
}

