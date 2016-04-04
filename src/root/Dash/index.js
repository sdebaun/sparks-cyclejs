import {Observable} from 'rx'
const {of} = Observable

import AppFrame from 'components/AppFrame'
import Header from 'components/Header'
import TabBar from 'components/TabBar'

import {mergeSinks} from 'util'
import {div} from 'helpers'

import ComingSoon from 'components/ComingSoon'

import {ResponsiveTitle} from 'components/Title'
import {MediumProfileAvatar} from 'components/profile'

import {
  // DescriptionListItem,
  RoutedComponent,
} from 'components/ui'

import Doing from './Doing'
import Being from './Being'

const _Tabs = sources => TabBar({...sources,
  tabs: of([
    {path: '/', label: 'Doing'},
    {path: '/finding', label: 'Finding'},
    {path: '/being', label: 'Being'},
  ]),
})

const _Nav = sources => ({
  DOM: sources.isMobile$.map(m => m ? null : sources.titleDOM),
})

const _Page = sources => RoutedComponent({...sources, routes$: of({
  '/': Doing,
  '/finding': ComingSoon('Dash/Finding'),
  '/being': Being,
})})

const _Title = sources => ResponsiveTitle({...sources,
  titleDOM$: sources.userName$,
  subtitleDOM$: of('Welcome'),
  leftDOM$: MediumProfileAvatar({...sources, src$: sources.portraitUrl$}).DOM,
  classes$: of(['profile']),
})

const LogoutRedirector = sources => ({
  route$: sources.redirectLogout$,
})

export default sources => {
  const _sources = {...sources,
    userName$: sources.userProfile$.map(up => up && up.fullName || 'None'),
    portraitUrl$: sources.userProfile$.map(up => up && up.portraitUrl),
  }

  const tabs = _Tabs(_sources)
  const title = _Title({..._sources, tabsDOM$: tabs.DOM})
  const nav = _Nav({..._sources, titleDOM: title.DOM})
  const header = Header({..._sources, titleDOM: title.DOM, tabsDOM: tabs.DOM})
  const page = _Page(_sources)

  const frame = AppFrame({..._sources,
    navDOM: nav.DOM,
    headerDOM: header.DOM,
    pageDOM: page.DOM.startWith(div({},['Loading...'])),
  })

  const redirect = LogoutRedirector(_sources)

  return {
    DOM: frame.DOM,
    ...mergeSinks(frame, page, tabs, title, nav, header, redirect),
  }
}
