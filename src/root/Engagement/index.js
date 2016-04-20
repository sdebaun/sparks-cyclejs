import {Observable as $} from 'rx'

import AppFrame from 'components/AppFrame'
import {TabbedTitle} from 'components/Title'

import {
  TabbedPage,
} from 'components/ui'

import {ProfileSidenav} from 'components/profile'

// import {log} from 'util'
import {mergeOrFlatMapLatest} from 'util'

import {div} from 'helpers'

import {
  Memberships,
  Commitments,
  Opps,
  Projects,
  ProjectImages,
} from 'components/remote'

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
import Application from './Application'
import Confirmation from './Confirmation'

import {label} from 'components/engagement'

export default sources => {
  const _sources = {...sources, ..._Fetch(sources)}

  const nav = ProfileSidenav(_sources)

  const tabs$ = _sources.engagement$.map(({isAccepted}) => [
    {path: '/', label: 'Priority'},
    {path: '/application', label: 'Application'},
    isAccepted && {path: '/confirmation', label: 'Confirmation'},
  ].filter(x => !!x))

  const page = TabbedPage({..._sources,
    tabs$,
    routes$: $.of({
      '/': Priority,
      '/application': Application,
      '/confirmation': Confirmation,
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
