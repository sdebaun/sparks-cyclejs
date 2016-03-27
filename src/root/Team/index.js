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

// import {log} from 'util'

import {
  ProjectImages,
  Teams,
  TeamImages,
  Opps,
} from 'components/remote'

import Glance from './Glance'
import Manage from './Manage'

const _routes = {
  '/': Glance,
  '/manage': Manage,
}

import {ProjectQuickNavMenu} from 'components/project'

const TeamNav = sources => {
  const glance = isolate(ListItemNavigating,'glance')({...sources,
    title$: just('At a Glance'),
    iconName$: just('home'),
    path$: just('/'),
  })
  const manage = isolate(ListItemNavigating,'manage')({...sources,
    title$: just('Manage'),
    iconName$: just('settings'),
    path$: just('/manage'),
  })

  const listDOM$ = combineLatest(glance.DOM, manage.DOM, (...doms) => doms)

  const route$ = merge(glance.route$, manage.route$)
    .map(sources.router.createHref)

  const DOM = combineLatest(
    sources.isMobile$,
    sources.titleDOM,
    listDOM$,
    (isMobile, titleDOM, listDOM) =>
      div({}, [
        isMobile ? null : titleDOM,
        div('.rowwrap', {style: {padding: '0px 15px'}}, listDOM),
      ])
  )

  return {
    DOM,
    route$,
  }
}

export default sources => {
  const teamKey$ = sources.teamKey$
  const team$ = teamKey$
    .flatMapLatest(key => sources.firebase('Teams',key))

  const projectKey$ = team$.pluck('projectKey')

  const project$ = projectKey$
    .flatMapLatest(projectKey => sources.firebase('Projects',projectKey))

  const projectImage$ = projectKey$
    .flatMapLatest(ProjectImages.query.one(sources))

  const teamImage$ = teamKey$
    .flatMapLatest(TeamImages.query.one(sources))

  const teams$ = projectKey$
    .flatMapLatest(Teams.query.byProject(sources))

  const opps$ = projectKey$
    .flatMapLatest(Opps.query.byProject(sources))

  const page$ = nestedComponent(
    sources.router.define(_routes),
    {team$, teamImage$, projectKey$, project$, teams$, opps$, ...sources}
  )

  const tabsDOM = page$.flatMapLatest(page => page.tabBarDOM)

  const quickNav = ProjectQuickNavMenu(
    {...sources, project$, projectKey$, team$, teams$, opps$}
  )

  const title = ResponsiveTitle({...sources,
    tabsDOM$: tabsDOM,
    topDOM$: quickNav.DOM,
    leftDOM$: teamImage$.map(i => i && i.dataUrl && iconSrc(i.dataUrl)),
    titleDOM$: team$.pluck('name'),
    subtitleDOM$: page$.flatMapLatest(page => page.pageTitle),
    backgroundUrl$: projectImage$.map(i => i && i.dataUrl),
  })

  const nav = TeamNav({
    titleDOM: title.DOM,
    project$,
    teams$,
    opps$,
    projectKey$,
    ...sources,
  })

  const header = Header({titleDOM: title.DOM, tabsDOM: tabsDOM, ...sources})

  const appFrame = AppFrame({
    navDOM: nav.DOM,
    headerDOM: header.DOM,
    pageDOM: page$.pluck('DOM'),
    ...sources,
  })

  const children = [appFrame, page$, quickNav, title, nav, header]

  const redirectOnLogout$ = sources.auth$.filter(auth => !auth).map(() => '/')

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
