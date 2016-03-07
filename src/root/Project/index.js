import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import {div, span} from 'cycle-snabbdom'

import AppFrame from 'components/AppFrame'
import TabBar from 'components/TabBar'
import ComingSoon from 'components/ComingSoon'

import {nestedComponent, mergeOrFlatMapLatest} from 'helpers/router'
import {icon} from 'helpers/dom'
import {layoutDOM} from 'helpers/layout'

import Dash from './Dash'

const _routes = {
  '/': Dash,
  '/staff': ComingSoon('Staff'),
  '/find': ComingSoon('Find'),
}

const _tabs = [
  {path: '/', label: 'Dash'},
  {path: '/staff', label: 'Staff'},
  {path: '/find', label: 'Find'},
]

const Title = sources => ({
  DOM: sources.isMobile$
    .map(isMobile =>
      div(
        {style: {border: '2px solid red'}},
        ['Page Title', isMobile ? sources.tabsDOM : null]
      )
    ),
})

const Nav = sources => ({
  DOM: sources.isMobile$
    .map(isMobile =>
      div(
        {style: {border: '2px solid blue'}},
        [isMobile ? null : sources.titleDOM, 'Nav Items']
      )
    ),
})

const Header = sources => ({
  DOM: sources.isMobile$
    .map(isMobile =>
      div(
        {style: {border: '2px solid yellow'}},
        [isMobile ? sources.titleDOM : sources.tabsDOM]
      )
    ),
})

export default sources => {
  const page$ = nestedComponent(sources.router.define(_routes),sources)
  const tabBar = TabBar({...sources, tabs: Observable.just(_tabs)})
  // const tabs = Tabs(sources)
  const title = Title({tabsDOM: tabBar.DOM, ...sources})
  const nav = Nav({titleDOM: title.DOM, ...sources})
  const header = Header({titleDOM: title.DOM, tabsDOM: tabBar.DOM, ...sources})

  const appFrame = AppFrame({
    navDOM: nav.DOM,
    headerDOM: header.DOM,
    pageDOM: page$.pluck('DOM'),
    ...sources,
  })

  const children = [appFrame, page$, tabBar, title, nav, header]

  const redirectOnLogout$ = sources.auth$.filter(auth => !auth).map(() => '/')

  const route$ = Observable.merge(
    mergeOrFlatMapLatest('route$', ...children),
    redirectOnLogout$,
  )

  return {
    DOM: appFrame.DOM,
    auth$: mergeOrFlatMapLatest('auth$', ...children),
    queue$: mergeOrFlatMapLatest('queue$', ...children),
    route$,
  }
}
