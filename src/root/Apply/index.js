import {Observable} from 'rx'
const {combineLatest} = Observable

// import combineLatestObj from 'rx-combine-latest-obj'
import isolate from '@cycle/isolate'

import ComingSoon from 'components/ComingSoon'
import SoloFrame from 'components/SoloFrame'
import {ResponsiveTitle} from 'components/Title'

import ApplyQuickNavMenu from 'components/ApplyQuickNavMenu'

import {rows, nestedComponent, mergeOrFlatMapLatest} from 'util'

import {div} from 'helpers'
// import {textTweetSized} from 'helpers/text'

const Glance = ComingSoon('Apply/Glance')
import Opp from './Opp'

import {
  Opps,
  ProjectImages,
  Projects,
} from 'components/remote'

const _routes = {
  // isolating breaks child tab navigation?
  '/': Glance,
  '/opp/:key': key => sources =>
    isolate(Opp)({oppKey$: Observable.just(key), ...sources}),
}

// const _render = ({
//   // titleDOM,
//   applyQuickNavMenuDOM,
//   pageDOM,
//   projectDescription,
// }) =>
//   col(
//     // titleDOM,
//     textTweetSized(projectDescription),
//     applyQuickNavMenuDOM,
//     pageDOM,
//   )

export default sources => {
  const projectKey$ = sources.projectKey$

  const project$ = projectKey$
    .flatMapLatest(Projects.query.one(sources))

  const projectImage$ = projectKey$
    .flatMapLatest(ProjectImages.query.one(sources))

  const opps$ = projectKey$
    .flatMapLatest(Opps.query.byProject(sources))

  const oppRows$ = opps$.map(rows)

  const title = ResponsiveTitle({
    titleDOM$: project$.pluck('name'),
    subtitleDOM$: oppRows$.map(opps =>
      opps.length + ' Opportunities Available'
    ),
    backgroundUrl$: projectImage$.map(pi => pi && pi.dataUrl),
    oppRows$,
    ...sources,
  })

  const applyQuickNavMenu = ApplyQuickNavMenu({opps$, project$, ...sources})

  const page$ = nestedComponent(sources.router.define(_routes), {
    project$,
    ...sources,
  })

  const pageDOM = combineLatest(
    applyQuickNavMenu.DOM,
    page$.flatMapLatest(({DOM}) => DOM),
    project$.pluck('description'),
    (...doms) => div({},doms),
  )

  const frame = SoloFrame({
    pageDOM,
    headerDOM: title.DOM,
    ...sources,
  })

  const children = [frame, page$, applyQuickNavMenu]

  const DOM = frame.DOM

  const auth$ = mergeOrFlatMapLatest('auth$', ...children)

  const queue$ = mergeOrFlatMapLatest('queue$', ...children)

  const route$ = mergeOrFlatMapLatest('route$', ...children)

  return {
    DOM,
    auth$,
    queue$,
    route$,
  }
}
