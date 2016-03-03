import {Observable} from 'rx'
import isolate from '@cycle/isolate'

import Landing from './Landing'
import Confirm from './Confirm'
import Dash from './Dash'
import Admin from './Admin'
import Project from './Project'

import {nestedComponent} from 'helpers/router'

import {log} from 'helpers'

import './styles.scss'

// Route definitions at this level
const routes = {
  '/': Landing,
  '/confirm/:id': id => sources => isolate(Confirm)(sources),
  '/dash': isolate(Dash),
  '/admin': isolate(Admin),
  '/project/:key': key => sources => Project({
    project$: sources.firebase('Projects',key),
    ...sources,
  }),
}

// const _isAuthWithoutProfile = ([auth, profileKey]) => auth && !profileKey

// const _isAuthWithProfile = ([auth, profileKey]) => auth && !!profileKey

export default sources => {
  const responses$ = sources.auth$
    .flatMapLatest(auth => auth ? sources.queue$(auth.uid) : Observable.empty())

  responses$.subscribe(log('responses$'))

  const userProfileKey$ = sources.auth$
    .flatMapLatest(auth =>
      auth ? sources.firebase('Users',auth.uid) : Observable.just(null)
    )

  const userProfile$ = userProfileKey$
    .distinctUntilChanged()
    .flatMapLatest(key =>
      key ? sources.firebase('Profiles',key) : Observable.just(null)
    )

  sources.auth$.subscribe(log('auth$'))
  userProfileKey$.subscribe(log('userProfileKey$'))
  userProfile$.subscribe(log('userProfile$'))

  const isUnconfirmed$ = userProfileKey$
    .withLatestFrom(sources.auth$)
    .filter(([profile,auth]) => !profile && !!auth)

  const redirectLogin$ = userProfile$
    .filter(profile => !!profile)
    .map(profile => profile.isAdmin ? '/admin' : '/dash')
    // .withLatestFrom(sources.auth$)
    // .filter(([profile,auth]) => !profile && !!auth)

  const redirectLogout$ = sources.auth$
    .filter(profile => !profile)
    .map(() => '/')

  const redirectUnconfirmed$ = isUnconfirmed$
    // .withLatestFrom(sources.auth$)
    // .filter(([profile,auth]) => !profile && !!auth)
    .map(() => '/confirm')

  redirectUnconfirmed$.subscribe(log('redirectUnconfirmed$'))

  const page$ = nestedComponent(sources.router.define(routes),{
    responses$, userProfileKey$, userProfile$, redirectLogin$, redirectLogout$,
    ...sources,
  })

  // dont do this yet
  // const authedRequests$ = page$
  //   .flatMapLatest(({queue$}) => queue$ || Observable.never())
  //   .withLatestFrom(sources.auth$)

  // authedRequests$.subscribe(log('authedRequests$'))

  // const isAuthenticated$ = sources.auth$
  //   .map(auth => auth !== null)
  //   .withLatestFrom(userProfileKey$.startWith(false))
  //   .do(log('isAuthenticated$'))

  // const rerouteToConfirm$ = isAuthenticated$
  //   .filter(_isAuthWithoutProfile)
  //   .map(([auth]) => `/confirm/${auth[auth.provider].id}`)
  //   .do(log('rerouteToConfirm$'))

  // const rerouteToDash$ = isAuthenticated$
  //   .filter(_isAuthWithProfile)
  //   .map(() => '/dash')
  //   .do(log('rerouteToDash$'))

  const router = page$
    .flatMapLatest(({route$}) => route$ || Observable.never())
    .merge(redirectUnconfirmed$)
    // .merge(rerouteToConfirm$, rerouteToDash$)

  router.subscribe(log('router'))

  return {
    DOM: page$.flatMapLatest(({DOM}) => DOM),
    auth$: page$.flatMapLatest(({auth$}) => auth$ || Observable.never()),
    queue$: page$.flatMapLatest(({queue$}) => queue$ || Observable.never()),
    router,
  }
}
