import {Observable} from 'rx'
const {of} = Observable

import isolate from '@cycle/isolate'

import SoloFrame from 'components/SoloFrame'
import {ResponsiveTitle} from 'components/Title'

import Opp from './Opp'
import Overview from './Overview'

import {
  DescriptionListItem,
  RoutedComponent,
} from 'components/ui'

import {
  Opps,
  ProjectImages,
  Projects,
} from 'components/remote'

// import {log} from 'util'
import {combineLatestToDiv, mergeSinks} from 'util'

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
  title$: sources.project$.pluck('description'),
})

const _Page = sources => RoutedComponent({...sources, routes$: of({
  '/': Overview,
  '/opp/:key': key => _sources =>
    isolate(Opp)({oppKey$: Observable.just(key), ..._sources}),
})})

export default sources => {
  const _sources = {...sources, ..._Fetch(sources)}

  const title = _Title(_sources)
  const desc = _Description(_sources)
  const page = _Page(_sources)

  const frame = SoloFrame({...sources,
    headerDOM: title.DOM,
    pageDOM: combineLatestToDiv(desc.DOM, page.DOM),
  })

  return {
    DOM: frame.DOM,
    ...mergeSinks(frame, page),
  }
}
