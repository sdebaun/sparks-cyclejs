import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import {div, span} from 'cycle-snabbdom'

import AppFrame from 'components/AppFrame'
import TabBar from 'components/TabBar'
import ComingSoon from 'components/ComingSoon'

import {nestedComponent, mergeOrFlatMapLatest} from 'helpers/router'
import {icon} from 'helpers/dom'
import {layoutDOM} from 'helpers/layout'

import {log} from 'helpers'

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

const _TitleDOM = ({isMobile,labelText,subLabelText,tabsDOM}) =>
  div(
    {style: {height: '80px', backgroundColor: '#666', color: '#FFF', padding: '0.5em'}},
    [
      div({style: {fontSize: '18px', fontWeight: 'bold'}},[labelText || 'No Label']),
      div({style: {fontSize: '14px'}},[subLabelText || 'No Sublabel']),
      isMobile ? tabsDOM : null,
    ]
  )

// const Title = sources => ({
const Title = ({isMobile$, labelText$, subLabelText$, tabsDOM$}) => {
  const DOM = combineLatestObj({
    isMobile$, labelText$, subLabelText$, tabsDOM$,
  }).map(_TitleDOM)

  return {DOM}
}

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
  const title = Title({
    tabsDOM$: tabBar.DOM,
    labelText$: sources.project$.pluck('name'),
    subLabelText$: Observable.just('At a Glance'),
    ...sources,
  })
  const nav = Nav({titleDOM: title.DOM, ...sources})
  const header = Header({titleDOM: title.DOM, tabsDOM: tabBar.DOM, ...sources})

  sources.project$.subscribe(log('project$'))

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
