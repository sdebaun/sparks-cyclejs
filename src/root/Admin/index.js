import {Observable} from 'rx'
const {of} = Observable
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

// const _Nav = sources => ({
//   DOM: sources.isMobile$
//     .map(isMobile =>
//       div(
//         {},
//         [isMobile ? null : sources.titleDOM, 'Nav Items']
//       )
//     ),
// })

const _Nav = sources => ({
  DOM: sources.isMobile$.map(m => m ? null : sources.titleDOM),
})

const _Title = sources => Title({...sources,
  labelText$: of('Administration'),
  subLabelText$: of('At a Glance'), // eventually page$.something
})

const _Page = sources => TabbedPage({...sources,
  tabs$: of([
    {path: '/', label: 'Projects'},
    {path: '/profiles', label: 'Profiles'},
    {path: '/previously', label: 'Previously'},
  ]),
  routes$: of({
    '/': Projects,
    '/profiles': ComingSoon('Admin/Dash'),
    '/previously': ComingSoon('Admin/Previously'),
  }),
})

export default sources => {
  const page = _Page(sources)
  const title = _Title({...sources, tabsDOM$: page.tabBarDOM})
  const nav = _Nav({...sources, titleDOM: title.DOM})
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
