import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import {div, span} from 'cycle-snabbdom'

// why arent these in root/index??
import 'normalize-css'
import '!style!css!snabbdom-material/lib/index.css'

import AppBar from 'components/AppBar'
import TabBar from 'components/TabBar'

import {nestedComponent, mergeOrFlatMapLatest} from 'helpers/router'
import {icon} from 'helpers/dom'
import {layoutDOM} from 'helpers/layout'

import Dash from './Dash'

const _routes = {
  '/': Dash,
}

const _tabs = [
  {path: '/', label: 'Dash'},
  {path: '/staff', label: 'Staff'},
  {path: '/find', label: 'Find'},
]

const Tabs = sources => ({
  DOM: Observable.just(div({style: {border: '2px solid green'}},'tabs')),
})

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

// import {sideNav} from 'helpers/layout/sideNav'
import {Col, Row} from 'snabbdom-material'

const defaultStyles = {
  zIndex: '1001',
  position: 'fixed',
  top: '0',
  bottom: '0',
  overflow: 'auto',
}

import {material} from 'helpers/dom'
import {Mask} from 'snabbdom-material'

    // Mask({isOpen, material, className: 'close-sideNav'}),

function renderSideNav(config, children) {
  const {className = '', style: userStyle = {}} = config
  const classes = ['sidenav', 'paper2', className].filter(Boolean)
  const style = Object.assign(defaultStyles, userStyle, material.sidenav)
  return div({},[
    Mask({isOpen: true, material, className: 'close-sideNav'}),
    div(`.${classes.join('.')}`, {style}, [
      span({}, children),
    ]),
  ])
}

const SideNav = sources => {
  const close$ = sources.DOM.select('.close-sideNav').events('click')
    .map(false)

  const _DOM = ({isMobile,isOpen,contentDOM}) =>
    isMobile && isOpen && renderSideNav({}, [contentDOM]) ||
      (!isMobile && div({},[contentDOM]) || span(''))
      // isOpen ? div({},[
      //   Mask({isOpen: true, material, className: 'close-sideNav'}),
      //   renderSideNav({}, [contentDOM]),
      // ]) : null
      // ) || div({},[contentDOM])

  const DOM = combineLatestObj({
    isMobile$: sources.isMobile$,
    isOpen$: sources.isOpen$.merge(close$),
    contentDOM$: sources.contentDOM,
  }).map(_DOM)

  return {
    DOM,
  }
}

const AppFrame = sources => {
  const appBar = AppBar(sources) // will need to pass auth

  const sideNav = SideNav({
    contentDOM: sources.navDOM,
    isOpen$: appBar.navButton$.map(true).startWith(false),
    ...sources,
  })

  const redirectOnLogout$ = sources.auth$.filter(auth => !auth).map(() => '/')

  return {
    DOM: sources.isMobile$
      .map(isMobile =>
        isMobile ?
          div({},[
            sideNav.DOM,
            appBar.DOM,
            sources.headerDOM,
            sources.pageDOM,
          ]) :
          div({},[
            appBar.DOM,
            Row({},[
              Col({type: 'xs-3'}, [sideNav.DOM]),
              Col({type: 'xs-9'}, [sources.headerDOM, sources.pageDOM]),
            ]),
          ])
      ),
  }
}

export default sources => {
  const page$ = nestedComponent(sources.router.define(_routes),sources)
  const tabs = TabBar({...sources, tabs: Observable.just(_tabs)})
  // const tabs = Tabs(sources)
  const title = Title({tabsDOM: tabs.DOM, ...sources})
  const nav = Nav({titleDOM: title.DOM, ...sources})
  const header = Header({titleDOM: title.DOM, tabsDOM: tabs.DOM, ...sources})

  const appFrame = AppFrame({
    navDOM: nav.DOM,
    headerDOM: header.DOM,
    pageDOM: page$.pluck('DOM'),
    ...sources,
  })

// --

  // const appBar = AppBar(sources) // will need to pass auth
  // const tabBar = TabBar({...sources, tabs: Observable.just(_tabs)})
  // const navContent = NavContent(sources)

  // const page$ = nestedComponent(sources.router.define(_routes),sources)

  // const children = [appBar,tabBar,navContent,page$]
  const children = [appFrame, page$]

  // const closeSideNav$ = sources.DOM.select('.close-sideNav').events('click')

  const redirectOnLogout$ = sources.auth$.filter(auth => !auth).map(() => '/')

  // const sidenavOpen$ = appBar.navButton$.map(true)
    // .merge(closeSideNav$.map(false))
    // .startWith(false)

  // const DOM = combineLatestObj({
  //   pageDOM$: page$.pluck('DOM'),
  //   appBarDOM$: appBar.DOM,
  //   tabBarDOM$: tabBar.DOM,
  //   navContentDOM$: navContent.DOM,
  //   isMobile$: sources.isMobile$,
  //   isOpen: sidenavOpen$,
  // }).map(layoutDOM)

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
