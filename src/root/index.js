import {Observable} from 'rx'
const {just, empty, merge} = Observable

import isolate from '@cycle/isolate'

import Landing from './Landing'
import Confirm from './Confirm'
import Dash from './Dash'
import Admin from './Admin'
import Project from './Project'
import Team from './Team'
import Opp from './Opp'
import Apply from './Apply'
import Engagement from './Engagement'
import Organize from './Organize'

import 'normalize-css'
import '!style!css!snabbdom-material/lib/index.css'

import {nestedComponent} from 'util'

// import {log} from 'util'

import './styles.scss'

// Route definitions at this level
const routes = {
  '/': Landing,
  '/confirm': isolate(Confirm),
  '/dash': isolate(Dash),
  '/admin': isolate(Admin),
  '/project/:key': key => sources =>
    isolate(Project)({projectKey$: just(key), ...sources}),
  '/team/:key': key => sources =>
    isolate(Team)({teamKey$: just(key), ...sources}),
  '/opp/:key': key => sources =>
    isolate(Opp)({oppKey$: just(key), ...sources}),
  '/apply/:key': key => sources =>
    isolate(Apply)({projectKey$: just(key), ...sources}),
  '/engaged/:key': key => sources =>
    isolate(Engagement)({engagementKey$: just(key), ...sources}),
  '/organize/:key': key => sources =>
    isolate(Organize)({organizerKey$: just(key), ...sources}),
}

const AuthRedirectManager = sources => {
  const redirectLogin$ = sources.userProfile$
    .filter(profile => !!profile)
    .map(profile => profile.isAdmin ? '/admin' : '/dash')

  const redirectLogout$ = sources.auth$
    .filter(profile => !profile)
    .map(() => '/')

  // this is the only global redirect, always gets piped to the router
  const redirectUnconfirmed$ = sources.userProfileKey$
    .withLatestFrom(sources.auth$)
    .filter(([profile,auth]) => !profile && !!auth)
    .map(() => '/confirm')

  return {
    redirectLogin$,
    redirectLogout$,
    redirectUnconfirmed$,
  }
}

const UserManager = sources => {
  const userProfileKey$ = sources.auth$
    .flatMapLatest(auth =>
      auth ? sources.firebase('Users', auth.uid) : just(null)
    )

  const userProfile$ = userProfileKey$
    .distinctUntilChanged()
    .flatMapLatest(key => {
      return key ? sources.firebase('Profiles', key) : just(null)
    })

  return {
    userProfile$,
    userProfileKey$,
  }
}

const AuthedResponseManager = sources => ({
  responses$: sources.auth$
    .flatMapLatest(auth => auth ? sources.queue$(auth.uid) : empty())
    .pluck('val')
    .share(),
})

const AuthedActionManager = sources => ({
  queue$: sources.queue$
    .withLatestFrom(sources.auth$)
    .map(([action,auth]) => ({uid: auth && auth.uid, ...action})),
})

export default sources => {
  const user = UserManager(sources)

  const redirects = AuthRedirectManager({...user, ...sources})

  const {responses$} = AuthedResponseManager(sources)

  const previousRoute$ = sources.router.observable
    .pluck('pathname')
    .scan((acc,val) => [val, acc[0]], [null,null])
    .filter(([_, curr]) => curr !== '/confirm')
    .map(arr => arr[1])
    .shareReplay(1)

  const page$ = nestedComponent(sources.router.define(routes), {
    ...sources,
    ...user,
    ...redirects,
    responses$,
    previousRoute$,
  })

  const DOM = page$.pluckFlat('DOM')

  const auth$ = page$.pluckFlat('auth$')

  const {queue$} =
    AuthedActionManager({...sources, queue$: page$.pluckFlat('queue$')})

  const router = merge(
    page$.pluckFlat('route$'),
    redirects.redirectUnconfirmed$,
  )

  return {
    DOM,
    auth$,
    queue$,
    router,
  }
}
