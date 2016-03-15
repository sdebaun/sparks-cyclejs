import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'
import isolate from '@cycle/isolate'

import {div, span} from 'cycle-snabbdom'

import AppFrame from 'components/AppFrame'
import Title from 'components/Title'
import Header from 'components/Header'
import TabBar from 'components/TabBar'
import ComingSoon from 'components/ComingSoon'
import ProjectNav from 'components/ProjectNav'

import {nestedComponent, mergeOrFlatMapLatest} from 'util'
import {icon} from 'helpers'

import {rows, log} from 'util'

import Dash from './Dash'
import Staff from './Staff'
import Photo from './Photo'

const _routes = {
  '/': isolate(Dash),
  '/staff': isolate(Staff),
  '/photo': isolate(Photo),
  '/find': ComingSoon('Find'),
}

const _tabs = [
  {path: '/', label: 'Dash'},
  {path: '/staff', label: 'Staff'},
  {path: '/find', label: 'Find'},
]

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

  const tabBar = TabBar({...sources, tabs: Observable.just(_tabs)})

  const title = Title({
    tabsDOM$: tabBar.DOM,
    labelText$: project$.pluck('name'),
    subLabelText$: Observable.just('At a Glance'), // eventually page$.something
    ...sources,
  })

  const nav = ProjectNav({titleDOM: title.DOM, project$, teams$, opps$, ...sources})

  const header = Header({titleDOM: title.DOM, tabsDOM: tabBar.DOM, ...sources})

  const appFrame = AppFrame({
    navDOM: nav.DOM,
    headerDOM: header.DOM,
    pageDOM: page$.pluck('DOM'),
    ...sources,
  })

  const children = [appFrame, page$, tabBar, title, nav, header]

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
