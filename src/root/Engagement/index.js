import {Observable as $} from 'rx'
// const {combineLatest} = Observable
// import isolate from '@cycle/isolate'

import AppFrame from 'components/AppFrame'
import {TabbedTitle} from 'components/Title'
import Header from 'components/Header'
// import {ProjectQuickNavMenu} from 'components/project/ProjectQuickNavMenu'
import {EngagementNav} from 'components/engagement'
import ComingSoon from 'components/ComingSoon'
import {nestedComponent, mergeOrFlatMapLatest} from 'util'
import {
  TabbedPage,
} from 'components/ui'
// import {log} from 'util'

import {div} from 'helpers'

import {
  Memberships,
  Commitments,
  Opps,
  Projects,
  ProjectImages,
} from 'components/remote'

import {ProfileSidenav} from 'components/profile'

// const _routes = {
//   '/': Glance,
//   '/application': Application,
//   '/schedule': Schedule,
// }

// const _Nav = sources => ({
//   DOM: sources.isMobile$.map(m => m ? null : sources.titleDOM),
// })

// const _Title = sources => ResponsiveTitle({...sources,
//   titleDOM$: sources.userName$,
//   subtitleDOM$: of('Welcome'),
//   leftDOM$: MediumProfileAvatar({...sources,
//     profileKey$: sources.userProfileKey$,
//   }).DOM,
//   classes$: of(['profile']),
// })

const _Fetch = sources => {
  const engagement$ = sources.engagementKey$
    .flatMapLatest(key => sources.firebase('Engagements',key))

  const oppKey$ = engagement$.pluck('oppKey')

  const commitments$ = oppKey$
    .flatMapLatest(Commitments.query.byOpp(sources))

  const opp$ = oppKey$
    .flatMapLatest(Opps.query.one(sources))

  const projectKey$ = opp$.pluck('projectKey')

  const project$ = projectKey$
    .flatMapLatest(Projects.query.one(sources))

  const projectImage$ = projectKey$
    .flatMapLatest(ProjectImages.query.one(sources))

  const memberships$ = sources.engagementKey$
    .flatMapLatest(Memberships.query.byEngagement(sources))

  return {
    engagement$,
    oppKey$,
    commitments$,
    opp$,
    projectKey$,
    project$,
    projectImage$,
    memberships$,
  }
}

import Priority from './Priority'
// import Application from './Application'
// import Confirm from './Schedule'

// const Priority = ComingSoon('Priority')
const Application = ComingSoon('Application')
const Confirm = ComingSoon('Confirm')

import {label} from 'components/engagement'

export default sources => {
  const _sources = {...sources, ..._Fetch(sources)}

  const nav = ProfileSidenav(_sources)

  const page = TabbedPage({..._sources,
    tabs$: $.of([
      {path: '/', label: 'Priority'},
      {path: '/application', label: 'Application'},
      {path: '/confirmation', label: 'Confirmation'},
    ]),
    routes$: $.of({
      '/': Priority,
      '/application': Application,
      '/confirmation': Confirm,
    }),
  })

  const title = TabbedTitle({..._sources,
    tabsDOM$: page.tabBarDOM,
    titleDOM$: _sources.project$.pluck('name'),
    subtitleDOM$: $.combineLatest(
      _sources.opp$.pluck('name'),
      _sources.engagement$.map(label),
      (name,lab) => `${name} | ${lab}`
    ),
    backgroundUrl$: _sources.projectImage$.map(i => i && i.dataUrl),
  })

  const frame = AppFrame({..._sources,
    navDOM: nav.DOM,
    pageDOM: $.combineLatest(
      title.DOM, page.DOM,
      (...doms) => div('', doms)
    ),
  })

  const children = [frame, page, nav]

  const redirectOnLogout$ = _sources.auth$.filter(auth => !auth).map(() => '/')

  const route$ = $.merge(
    mergeOrFlatMapLatest('route$', ...children),
    redirectOnLogout$,
  )

  return {
    DOM: frame.DOM,
    auth$: mergeOrFlatMapLatest('auth$', ...children),
    queue$: mergeOrFlatMapLatest('queue$', ...children),
    route$,
  }
}

// ({
//   pageTitle: $.of('Engagement'),

//   ...TabbedPage({...sources,
//     tabs$: $.of([
//       {path: '/', label: 'Priority'},
//       {path: '/application', label: 'Application'},
//       {path: '/confirmation', label: 'Confirmation'},
//     ]),
//     routes$: $.of({
//       '/': Priority,
//       '/application': Application,
//       '/confirmation': Confirm,
//     }),
//   }),
// })
