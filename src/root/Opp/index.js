import {Observable} from 'rx'
const {of, combineLatest} = Observable

import AppFrame from 'components/AppFrame'
import {ResponsiveTitle} from 'components/Title'
import Header from 'components/Header'
import {OppNav} from 'components/opp'

import {mergeSinks} from 'util'

// import {log} from 'util'

import {
  Opps,
  ProjectImages,
  Teams,
  Projects,
} from 'components/remote'

import {
  LogoutRedirector,
} from 'components/redirects'

import {
  RoutedComponent,
} from 'components/ui'

import {ProjectQuickNavMenu} from 'components/project'

import Glance from './Glance'
import Manage from './Manage'
import Engaged from './Engaged'

const _Fetch = sources => {
  const opp$ = sources.oppKey$
    .flatMapLatest(Opps.query.one(sources))

  const projectKey$ = opp$.pluck('projectKey')

  const project$ = projectKey$
    .flatMapLatest(Projects.query.one(sources))

  const projectImage$ = projectKey$
    .flatMapLatest(ProjectImages.query.one(sources))

  const teams$ = projectKey$
    .flatMapLatest(Teams.query.byProject(sources))

  const opps$ = projectKey$
    .flatMapLatest(Opps.query.byProject(sources))

  return {
    opp$,
    projectKey$,
    project$,
    projectImage$,
    teams$,
    opps$,
  }
}

const _Title = sources => ResponsiveTitle({...sources,
  titleDOM$: sources.opp$.pluck('name'),
  subtitleDOM$: combineLatest(
    sources.isMobile$, sources.pageTitle$,
    (isMobile, pageTitle) => isMobile ? pageTitle : null,
  ),
  backgroundUrl$: sources.projectImage$.map(i => i && i.dataUrl),
})

const _Page = sources => RoutedComponent({...sources, routes$: of({
  '/': Glance,
  '/manage': Manage,
  '/engaged': Engaged,
})})

export default sources => {
  const _sources = {...sources, ..._Fetch(sources)}

  const page = _Page(_sources)
  const qn = ProjectQuickNavMenu(_sources)
  const title = _Title({..._sources,
    pageTitle$: page.pluck('pageTitle'),
    tabsDOM$: page.pluck('tabBarDOM'),
    topDOM$: qn.DOM,
  })
  const nav = OppNav({..._sources, titleDOM: title.DOM})
  const header = Header({..._sources,
    titleDOM: title.DOM,
    tabsDOM: page.pluck('tabBarDOM'),
  })
  const frame = AppFrame({..._sources,
    navDOM: nav.DOM,
    headerDOM: header.DOM,
    pageDOM: page.DOM,
  })
  const redirect = LogoutRedirector(_sources)

  return {
    DOM: frame.DOM,
    ...mergeSinks(frame, page, qn, title, nav, header, redirect),
  }
}
