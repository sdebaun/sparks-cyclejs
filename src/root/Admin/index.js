import {Observable} from 'rx'
const {just} = Observable
// import combineLatestObj from 'rx-combine-latest-obj'

import {div} from 'cycle-snabbdom'

import AppFrame from 'components/AppFrame'
import Title from 'components/Title'
import Header from 'components/Header'

import {mergeOrFlatMapLatest} from 'util'
// import {icon} from 'helpers'

import ComingSoon from 'components/ComingSoon'

import Projects from './Projects.js'

import {TabbedPage} from 'components/ui'

const _routes = {
  '/': Projects,
  '/profiles': ComingSoon('Admin/Dash'),
  '/previously': ComingSoon('Admin/Previously'),
}

const _tabs = [
  {path: '/', label: 'Projects'},
  {path: '/profiles', label: 'Profiles'},
  {path: '/previously', label: 'Previously'},
]

const Nav = sources => ({
  DOM: sources.isMobile$
    .map(isMobile =>
      div(
        {},
        [isMobile ? null : sources.titleDOM, 'Nav Items']
      )
    ),
})

export default sources => {
  const page = TabbedPage({...sources,
    tabs$: just(_tabs),
    routes$: just(_routes),
  })

  const title = Title({...sources,
    tabsDOM$: page.tabBarDOM,
    labelText$: Observable.just('Administration'),
    subLabelText$: Observable.just('At a Glance'), // eventually page$.something
  })

  const nav = Nav({titleDOM: title.DOM, ...sources})

  const header = Header({...sources,
    titleDOM: title.DOM,
    tabsDOM: page.tabBarDOM,
  })

  const appFrame = AppFrame({
    navDOM: nav.DOM,
    headerDOM: header.DOM,
    pageDOM: page.DOM,
    ...sources,
  })

  const children = [appFrame, page, title, nav, header]

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
