import {Observable} from 'rx'
const {just} = Observable

import {div} from 'cycle-snabbdom'

import AppFrame from 'components/AppFrame'
import Header from 'components/Header'
import TabBar from 'components/TabBar'

import {nestedComponent, mergeOrFlatMapLatest} from 'util'

import ComingSoon from 'components/ComingSoon'

import {ResponsiveTitle} from 'components/Title'
import {MediumProfileAvatar} from 'components/profile'

import Doing from './Doing'

const _routes = {
  '/': Doing,
  '/finding': ComingSoon('Dash/Finding'),
  '/being': ComingSoon('Dash/Being'),
}

const _tabs = [
  {path: '/', label: 'Doing'},
  {path: '/finding', label: 'Finding'},
  {path: '/being', label: 'Being'},
]

const Nav = sources => ({
  DOM: sources.isMobile$
    .map(isMobile =>
      div(
        {},
        [isMobile ? null : sources.titleDOM, '']
      )
    ),
})

export default sources => {
  const page$ = nestedComponent(sources.router.define(_routes),sources)

  const userName$ = sources.userProfile$.map(up => up && up.fullName || 'None')
  const portraitUrl$ = sources.userProfile$.map(up => up && up.portraitUrl)

  const tabBar = TabBar({...sources, tabs: Observable.just(_tabs)})

  const title = ResponsiveTitle({...sources,
    tabsDOM$: tabBar.DOM,
    titleDOM$: userName$,
    subtitleDOM$: just('Welcome'),
    leftDOM$: MediumProfileAvatar({...sources, src$: portraitUrl$}).DOM,
    classes$: just(['profile']),
  })

  const nav = Nav({titleDOM: title.DOM, ...sources})

  const header = Header({titleDOM: title.DOM, tabsDOM: tabBar.DOM, ...sources})

  const appFrame = AppFrame({
    navDOM: nav.DOM,
    headerDOM: header.DOM,
    pageDOM: page$.pluck('DOM'),
    ...sources,
  })

  const children = [appFrame, page$, tabBar, title, nav, header]

  const route$ = Observable.merge(
    mergeOrFlatMapLatest('route$', ...children),
    sources.redirectLogout$,
  )

  return {
    DOM: appFrame.DOM,
    auth$: mergeOrFlatMapLatest('auth$', ...children),
    queue$: mergeOrFlatMapLatest('queue$', ...children),
    route$,
  }
}
