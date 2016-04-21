import {Observable} from 'rx'
const {of} = Observable

import AppFrame from 'components/AppFrame'
import Header from 'components/Header'

import {mergeSinks} from 'util'

import {ResponsiveTitle} from 'components/Title'
import {MediumProfileAvatar} from 'components/profile'

import {
  TabbedPage,
} from 'components/ui'

import {
  LogoutRedirector,
} from 'components/redirects'

import Doing from './Doing'
import Being from './Being'

import {ProfileSidenav} from 'components/profile'

const _Page = sources => TabbedPage({...sources,
  tabs$: of([
    {path: '/', label: 'Doing'},
    {path: '/being', label: 'Being'},
  ]),
  routes$: of({
    '/': Doing,
    '/being': Being,
  }),
})

export default sources => {
  const page = _Page(sources)
  // const title = _Title({...sources, tabsDOM$: page.tabBarDOM})
  const header = Header({...sources,
    // titleDOM: of(null),
    tabsDOM: page.tabBarDOM,
  })

  const nav = ProfileSidenav(sources)

  const frame = AppFrame({...sources,
    navDOM: nav.DOM,
    headerDOM: header.DOM,
    pageDOM: page.DOM,
  })

  const redirect = LogoutRedirector(sources)

  return {
    DOM: frame.DOM,
    ...mergeSinks(frame, page, nav, header, redirect),
  }
}
