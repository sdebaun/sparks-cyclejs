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

// import {nestedComponent} from 'util'

import {RoutedComponent} from 'components/ui'

import {log} from 'util'

import './styles.scss'

// Route definitions at this level
const _routes = {
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

import {
  Projects,
  Engagements,
} from 'components/remote'

const UserManager = sources => {
  const userProfileKey$ = sources.auth$
    .flatMapLatest(auth =>
      auth ? sources.firebase('Users', auth.uid) : just(null)
    )
    .shareReplay(1)

  const userProfile$ = userProfileKey$
    .distinctUntilChanged()
    .flatMapLatest(key => {
      return key ? sources.firebase('Profiles', key) : just(null)
    })
    .shareReplay(1)

  const userName$ = userProfile$
    .map(up => up && up.fullName || 'None')
    .shareReplay(1)

  const userPortraitUrl$ = userProfile$
    .map(up => up && up.portraitUrl)
    .shareReplay(1)

  const user = {
    projectsOwned$: userProfileKey$
      .flatMapLatest(Projects.query.byOwner(sources)),
    engagements$: userProfileKey$
      .flatMapLatest(Engagements.query.byUser(sources)),
  }

  return {
    userProfile$,
    userProfileKey$,
    userName$,
    userPortraitUrl$,
    user,
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

import {SideNav} from './SideNav'
// import {ProfileSidenav} from 'components/profile'
import {pluckLatest, pluckLatestOrNever} from 'util'

const SwitchedComponent = sources => {
  const comp$ = sources.Component$
    .distinctUntilChanged()
    .map(C => isolate(C)(sources))
    .shareReplay(1)

  return {
    pluck: key => pluckLatestOrNever(key, comp$),
    DOM: pluckLatest('DOM', comp$),
    ...['auth$', 'queue$', 'route$'].reduce((a,k) =>
      (a[k] = pluckLatestOrNever(k,comp$)) && a, {}
    ),
  }
}

const BlankSidenav = () => ({
  DOM: just(null),
})

export default _sources => {
  const user = UserManager(_sources)

  const redirects = AuthRedirectManager({...user, ..._sources})

  const {responses$} = AuthedResponseManager(_sources)

  const previousRoute$ = _sources.router.observable
    .pluck('pathname')
    .scan((acc,val) => [val, acc[0]], [null,null])
    .filter(arr => arr[1] !== '/confirm')
    .map(arr => arr[1])
    .shareReplay(1)

  // confirm redirect doesnt work without this log line!!!  wtf??
  previousRoute$.subscribe(log('index.previousRoute$'))

  const sources = {
    ..._sources,
    ...user,
    ...redirects,
    responses$,
    previousRoute$,
  }

  const nav = SwitchedComponent({...sources,
    Component$: sources.userProfile$
      .map(up => up ? SideNav : BlankSidenav),
  })

  nav.route$.subscribe(x => console.log('navroute',x))

  const page = RoutedComponent({...sources,
    routes$: just(_routes),
    navDOM$: nav.DOM,
  })

  const DOM = page.DOM

  const auth$ = page.auth$

  const {queue$} = AuthedActionManager({...sources, queue$: page.queue$})

  const router = merge(
    page.route$,
    nav.pluck('route$'),
    redirects.redirectUnconfirmed$,
  )

  return {
    DOM,
    auth$,
    queue$,
    router,
  }
}
