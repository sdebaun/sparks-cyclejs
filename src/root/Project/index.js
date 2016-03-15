import {Observable} from 'rx'
// import combineLatestObj from 'rx-combine-latest-obj'
// import isolate from '@cycle/isolate'

import AppFrame from 'components/AppFrame'
import Title from 'components/Title'
import Header from 'components/Header'
import ProjectNav from 'components/ProjectNav'
// import ComingSoon from 'components/ComingSoon'

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

export default sources => {
  const projectKey$ = sources.projectKey$

  const projectImage$ = projectKey$
    .flatMapLatest(projectKey => sources.firebase('ProjectImages',projectKey))

  const project$ = projectKey$
    .flatMapLatest(projectKey => sources.firebase('Projects',projectKey))

  const teams$ = projectKey$
    .flatMapLatest(projectKey => sources.firebase('Teams',{
      orderByChild: 'projectKey',
      equalTo: projectKey,
    }))

  const opps$ = projectKey$
    .flatMapLatest(projectKey => sources.firebase('Opps', {
      orderByChild: 'projectKey',
      equalTo: projectKey,
    }))

  const organizers$ = sources.projectKey$
    .flatMapLatest(key => sources.firebase('Organizers',{
      orderByChild: 'projectKey',
      equalTo: key,
    }))

  const page$ = nestedComponent(
    sources.router.define(_routes),
    {project$, projectImage$, teams$, organizers$, ...sources}
  )

  const tabsDOM = page$.flatMapLatest(page => page.tabBarDOM)

  const labelText$ = project$.pluck('name')
  const subLabelText$ = page$.flatMapLatest(page => page.pageTitle)

  const title = Title({
    tabsDOM$: tabsDOM,
    labelText$,
    subLabelText$,
    ...sources,
  })

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
