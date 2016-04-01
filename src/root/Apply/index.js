import {Observable} from 'rx'
const {just, combineLatest} = Observable

// import combineLatestObj from 'rx-combine-latest-obj'
import isolate from '@cycle/isolate'

import ComingSoon from 'components/ComingSoon'
import SoloFrame from 'components/SoloFrame'
import {ResponsiveTitle} from 'components/Title'

import ApplyQuickNavMenu from 'components/ApplyQuickNavMenu'

import {rows, nestedComponent, mergeOrFlatMapLatest} from 'util'

import {div, icon} from 'helpers'
// import {textTweetSized} from 'helpers/text'

// const Overview = ComingSoon('Apply/Overview')
import Opp from './Opp'
import Overview from './Overview'

import {
  List,
  ListItem,
  ListItemNavigating,
} from 'components/sdm'

import {
  QuotingListItem,
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

const Title = sources => ResponsiveTitle({...sources,
  titleDOM$: sources.project$.pluck('name'),
  subtitleDOM$: sources.opps$.map(opps =>
    opps.length + ' Opportunities Available'
  ),
  backgroundUrl$: sources.projectImage$.map(pi => pi && pi.dataUrl),
  ...sources,
})

const Description = sources => DescriptionListItem({...sources,
  item$: sources.project$,
})

export default sources => {
  const projectKey$ = sources.projectKey$

  const project$ = projectKey$
    .flatMapLatest(Projects.query.one(sources))

  const projectImage$ = projectKey$
    .flatMapLatest(ProjectImages.query.one(sources))

  const opps$ = projectKey$
    .flatMapLatest(Opps.query.byProject(sources))
    .map(opps => opps.filter(({isPublic}) => isPublic))

  const _sources = {...sources, project$, opps$, projectImage$}

  const title = Title(_sources)

  const desc = Description(_sources)

  // const applyQuickNavMenu = ApplyQuickNavMenu({opps$, project$, ...sources})

  const page$ = nestedComponent(sources.router.define(_routes), _sources)

  const pageDOM = combineLatest(
    desc.DOM,
    // applyQuickNavMenu.DOM,
    page$.pluck('DOM').switch(),
    (...doms) => div({},doms),
  )

  const frame = SoloFrame({
    pageDOM,
    headerDOM: title.DOM,
    ...sources,
  })

  const children = [frame, page$]

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
