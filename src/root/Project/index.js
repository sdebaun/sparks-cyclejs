import {Observable} from 'rx'
// import combineLatestObj from 'rx-combine-latest-obj'
// import isolate from '@cycle/isolate'

import AppFrame from 'components/AppFrame'
import Title from 'components/Title'
import Header from 'components/Header'
import {ProjectNav} from 'components/project'
// import ComingSoon from 'components/ComingSoon'

import {ResponsiveTitle} from 'components/Title'

import {nestedComponent, mergeOrFlatMapLatest} from 'util'


import Glance from './Glance'
import Manage from './Manage'

const _routes = {
  // isolating breaks child tab navigation?
  // '/': isolate(Glance),
  // '/manage': isolate(Manage),
  '/': Glance,
  '/manage': Manage,
}

import {
  Projects,
  ProjectImages,
  Teams,
  Opps,
  Organizers,
} from 'components/remote'

export default sources => {
  const projectKey$ = sources.projectKey$

  const project$ = sources.projectKey$
    .flatMapLatest(Projects.query.one(sources))

  const projectImage$ = sources.projectKey$
    .flatMapLatest(ProjectImages.query.one(sources))

  const teams$ = sources.projectKey$
    .flatMapLatest(Teams.query.byProject(sources))

  const opps$ = projectKey$
    .flatMapLatest(Opps.query.byProject(sources))

  const organizers$ = sources.projectKey$
    .flatMapLatest(Organizers.query.byProject(sources))

  const page$ = nestedComponent(
    sources.router.define(_routes),
    {project$, projectImage$, teams$, organizers$, ...sources}
  )

  const tabsDOM = page$.flatMapLatest(page => page.tabBarDOM)

  // const labelText$ = project$.pluck('name')
  // const subLabelText$ = page$.flatMapLatest(page => page.pageTitle)

  const title = ResponsiveTitle({...sources,
    tabsDOM$: tabsDOM,
    titleDOM$: project$.pluck('name'),
    subtitleDOM$: page$.flatMapLatest(page => page.pageTitle),
    // leftDOM$: MediumProfileAvatar({...sources, src$: portraitUrl$}).DOM,
    // classes$: just(['profile']),
  })

  // const title = Title({
  //   tabsDOM$: tabsDOM,
  //   labelText$,
  //   subLabelText$,
  //   backgroundUrl$: projectImage$.map(pi => pi && pi.dataUrl),
  //   ...sources,
  // })

  const nav = ProjectNav({
    titleDOM: title.DOM,
    project$,
    teams$,
    opps$,
    ...sources,
  })

  const header = Header({titleDOM: title.DOM, tabsDOM, ...sources})

  const appFrame = AppFrame({
    navDOM: nav.DOM,
    headerDOM: header.DOM,
    pageDOM: page$.pluck('DOM'),
    ...sources,
  })

  const children = [appFrame, page$, title, nav, header]

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
