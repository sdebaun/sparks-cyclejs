import {Observable} from 'rx'
const {combineLatest} = Observable

// import combineLatestObj from 'rx-combine-latest-obj'
import isolate from '@cycle/isolate'

import SoloFrame from 'components/SoloFrame'
import {ResponsiveTitle} from 'components/Title'

import {nestedComponent, mergeOrFlatMapLatest} from 'util'

import {div} from 'helpers'
// import {textTweetSized} from 'helpers/text'

// const Overview = ComingSoon('Apply/Overview')
import Opp from './Opp'
import Overview from './Overview'

import {
  DescriptionListItem,
} from 'components/ui'

import {
  Opps,
  ProjectImages,
  Projects,
} from 'components/remote'

const _routes = {
  // isolating breaks child tab navigation?
  '/': Overview,
  '/opp/:key': key => sources =>
    isolate(Opp)({oppKey$: Observable.just(key), ...sources}),
}

const _Fetch = sources => {
  const project$ = sources.projectKey$
    .flatMapLatest(Projects.query.one(sources))

  const projectImage$ = sources.projectKey$
    .flatMapLatest(ProjectImages.query.one(sources))

  const opps$ = sources.projectKey$
    .flatMapLatest(Opps.query.byProject(sources))
    .map(opps => opps.filter(({isPublic}) => isPublic))

  return {
    project$,
    projectImage$,
    opps$,
  }
}

const _Title = sources => ResponsiveTitle({...sources,
  titleDOM$: sources.project$.pluck('name'),
  subtitleDOM$: sources.opps$.map(o => o.length + ' Opportunities Available'),
  backgroundUrl$: sources.projectImage$.map(pi => pi && pi.dataUrl),
})

const _Description = sources => DescriptionListItem({...sources,
  item$: sources.project$,
})

export default sources => {
  const _sources = {...sources, ..._Fetch(sources)}

  const title = _Title(_sources)

  const desc = _Description(_sources)

  const page$ = nestedComponent(sources.router.define(_routes), _sources)

  const pageDOM = combineLatest(
    desc.DOM,
    page$.pluck('DOM').switch(),
    (...doms) => div({},doms),
  )

  const frame = SoloFrame({...sources,
    pageDOM,
    headerDOM: title.DOM,
  })

  const children = [frame, page$]

  const auth$ = mergeOrFlatMapLatest('auth$', ...children)
  const queue$ = mergeOrFlatMapLatest('queue$', ...children)
  const route$ = mergeOrFlatMapLatest('route$', ...children)

  return {
    DOM: frame.DOM,
    auth$,
    queue$,
    route$,
  }
}
