import {Observable} from 'rx'
const {just, merge, combineLatest} = Observable
import isolate from '@cycle/isolate'

import AppFrame from 'components/AppFrame'
import Header from 'components/Header'

import {ResponsiveTitle} from 'components/Title'

import {div, iconSrc} from 'helpers'

// import ComingSoon from 'components/ComingSoon'

import {nestedComponent, mergeOrFlatMapLatest} from 'util'

import {ListItemNavigating} from 'components/sdm'

import {combineLatestToDiv} from 'util'
// import {log} from 'util'

import {
  ProjectImages,
  Teams,
  TeamImages,
  Opps,
} from 'components/remote'

import Glance from './Glance'
import Manage from './Manage'
import Members from './Members'

const _routes = {
  '/': Glance,
  '/manage': Manage,
  '/members': Members,
}

import {ProjectQuickNavMenu} from 'components/project'

const GlanceNav = sources => ListItemNavigating({...sources,
  title$: just('At a Glance'),
  iconName$: just('home'),
  path$: just('/'),
})

const ManageNav = sources => ListItemNavigating({...sources,
  title$: just('Manage'),
  iconName$: just('settings'),
  path$: just('/manage'),
})

const MembersNav = sources => ListItemNavigating({...sources,
  title$: just('Members'),
  iconName$: just('people'),
  path$: just('/members'),
})

const TeamNav = sources => {
  const childs = [
    isolate(GlanceNav,'glance')(sources),
    isolate(ManageNav,'manage')(sources),
    isolate(MembersNav,'members')(sources),
  ]

  const listDOM$ = combineLatestToDiv(...childs.map(c => c.DOM))

  const route$ = merge(childs.map(c => c.route$))
    .map(sources.router.createHref)

  const DOM = combineLatest(
    sources.isMobile$,
    sources.titleDOM,
    listDOM$,
    (isMobile, titleDOM, listDOM) =>
      div({}, [
        isMobile ? null : titleDOM,
        div('.rowwrap', {style: {padding: '0px 15px'}}, [listDOM]),
      ])
  )

  return {
    DOM,
    route$,
  }
}

const _Fetch = sources => {
  const team$ = sources.teamKey$
    .flatMapLatest(key => sources.firebase('Teams',key))

  const projectKey$ = team$.pluck('projectKey')

  const project$ = projectKey$
    .flatMapLatest(projectKey => sources.firebase('Projects',projectKey))

  const projectImage$ = projectKey$
    .flatMapLatest(ProjectImages.query.one(sources))

  const teamImage$ = sources.teamKey$
    .flatMapLatest(TeamImages.query.one(sources))

  const teams$ = projectKey$
    .flatMapLatest(Teams.query.byProject(sources))

  const opps$ = projectKey$
    .flatMapLatest(Opps.query.byProject(sources))

  return {
    team$, projectKey$, project$, projectImage$, teamImage$, teams$, opps$,
  }
}

const TeamTitle = sources => ResponsiveTitle({...sources,
  tabsDOM$: sources.tabsDOM,
  topDOM$: sources.quickNavDOM,
  leftDOM$: sources.teamImage$.map(i => i && i.dataUrl && iconSrc(i.dataUrl)),
  titleDOM$: sources.team$.pluck('name'),
  subtitleDOM$: combineLatest(
    sources.isMobile$,
    sources.pageTitle$,
    (isMobile, pageTitle) => isMobile ? pageTitle : null,
  ),
  backgroundUrl$: sources.projectImage$.map(i => i && i.dataUrl),
})

export default sources => {
  const _sources = {...sources, ..._Fetch(sources)}

  const page$ = nestedComponent(sources.router.define(_routes), _sources)

  const tabsDOM = page$.flatMapLatest(page => page.tabBarDOM)

  const quickNav = ProjectQuickNavMenu(_sources)

  const title = TeamTitle({..._sources,
    tabsDOM,
    quickNavDOM: quickNav.DOM,
    pageTitle$: page$.flatMapLatest(page => page.pageTitle),
  })

  const nav = TeamNav({..._sources, titleDOM: title.DOM})

  const header = Header({titleDOM: title.DOM, tabsDOM: tabsDOM, ...sources})

  const appFrame = AppFrame({
    navDOM: nav.DOM,
    headerDOM: header.DOM,
    pageDOM: page$.pluck('DOM'),
    ...sources,
  })

  const children = [appFrame, page$, quickNav, title, nav, header]

  // const redirectOnLogout$ = sources.auth$.filter(auth => !auth).map(() => '/')

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
