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

// export default sources => {
//   const engagement$ = sources.engagementKey$
//     .flatMapLatest(key => sources.firebase('Engagements',key))

//   const oppKey$ = engagement$.pluck('oppKey')

//   const commitments$ = oppKey$
//     .flatMapLatest(Commitments.query.byOpp(sources))

//   const opp$ = oppKey$
//     .flatMapLatest(Opps.query.one(sources))

//   const projectKey$ = opp$.pluck('projectKey')

//   const project$ = projectKey$
//     .flatMapLatest(Projects.query.one(sources))

//   const projectImage$ = projectKey$
//     .flatMapLatest(ProjectImages.query.one(sources))

//   const memberships$ = sources.engagementKey$
//     .flatMapLatest(Memberships.query.byEngagement(sources))

//   const page$ = nestedComponent(
//     sources.router.define(_routes), {
//       ...sources,
//       engagement$,
//       oppKey$,
//       opp$,
//       projectKey$,
//       project$,
//       memberships$,
//       commitments$,
//     })

//   // const quickNav = ProjectQuickNavMenu(
//   //   {...sources, project$, projectKey$, opp$, teams$, opps$}
//   // )

//   const tabsDOM = page$.flatMapLatest(page => page.tabBarDOM)

//   const subtitleDOM$ = $.combineLatest(
//     sources.isMobile$,
//     page$.flatMapLatest(page => page.pageTitle),
//     (isMobile, pageTitle) => isMobile ? pageTitle : null,
//   )

//   const title = ResponsiveTitle({...sources,
//     tabsDOM$: tabsDOM,
//     // topDOM$: quickNav.DOM,
//     titleDOM$: opp$.pluck('name'),
//     subtitleDOM$,
//     backgroundUrl$: projectImage$.map(i => i && i.dataUrl),
//   })

//   // const nav = EngagementNav({...sources,
//   //   titleDOM: title.DOM,
//   //   engagement$,
//   // })

//   const nav = ProfileSidenav(sources)

//   const header = Header({...sources,
//     titleDOM: title.DOM,
//     tabsDOM: tabsDOM,
//   })

//   const appFrame = AppFrame({...sources,
//     navDOM: nav.DOM,
//     headerDOM: header.DOM,
//     pageDOM: page$.pluck('DOM'),
//   })

//   const children = [appFrame, page$, title, nav, header]

//   const redirectOnLogout$ = sources.auth$.filter(auth => !auth).map(() => '/')

//   const route$ = $.merge(
//     mergeOrFlatMapLatest('route$', ...children),
//     redirectOnLogout$,
//   )

//   return {
//     DOM: appFrame.DOM,
//     auth$: mergeOrFlatMapLatest('auth$', ...children),
//     queue$: mergeOrFlatMapLatest('queue$', ...children),
//     route$,
//   }
// }

// import Priority from './Glance'
// import Application from './Application'
// import Confirm from './Schedule'

const Priority = ComingSoon('Priority')
const Application = ComingSoon('Application')
const Confirm = ComingSoon('Confirm')

import {label} from 'components/engagement'

export default sources => {
  const _sources = {...sources, ..._Fetch(sources)}

  const nav = ProfileSidenav(sources)

  const page = TabbedPage({...sources,
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

  const title = TabbedTitle({...sources,
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

  const redirectOnLogout$ = sources.auth$.filter(auth => !auth).map(() => '/')

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
