import {Observable} from 'rx'
const {of} = Observable

import AppFrame from 'components/AppFrame'
import Header from 'components/Header'

import {mergeSinks} from 'util'

import ComingSoon from 'components/ComingSoon'

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

const _Nav = sources => ({
  DOM: sources.isMobile$.map(m => m ? null : sources.titleDOM),
})

const _Page = sources => TabbedPage({...sources,
  tabs$: of([
    {path: '/', label: 'Doing'},
    {path: '/finding', label: 'Finding'},
    {path: '/being', label: 'Being'},
  ]),
  routes$: of({
    '/': Doing,
    '/finding': ComingSoon('Dash/Finding'),
    '/being': Being,
  }),
})

const _Title = sources => ResponsiveTitle({...sources,
  titleDOM$: sources.userName$,
  subtitleDOM$: of('Welcome'),
  leftDOM$: MediumProfileAvatar({...sources,
    profileKey$: sources.userProfileKey$,
  }).DOM,
  classes$: of(['profile']),
})

export default sources => {
  const _sources = {...sources,
    userName$: sources.userProfile$.map(up => up && up.fullName || 'None'),
    portraitUrl$: sources.userProfile$.map(up => up && up.portraitUrl),
  }

  const page = _Page(_sources)
  const title = _Title({..._sources, tabsDOM$: page.tabBarDOM})
  const nav = _Nav({..._sources, titleDOM: title.DOM})
  const header = Header({..._sources,
    titleDOM: title.DOM, tabsDOM: page.tabBarDOM,
  })

  const frame = AppFrame({..._sources,
    navDOM: nav.DOM,
    headerDOM: header.DOM,
    pageDOM: page.DOM,
  })

  const redirect = LogoutRedirector(_sources)

  return {
    DOM: frame.DOM,
    ...mergeSinks(frame, page, title, nav, header, redirect),
  }
}
