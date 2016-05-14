import {Observable as $} from 'rx'
import {div} from 'cycle-snabbdom'
import Drop from './drop'
import Crop from './crop'

const component = sources => {
  const drop$ = sources.props$
    .pluck('image')
    .distinctUntilChanged()
    .map(() => Drop(sources))
    .shareReplay(1)

  const file$ = drop$
    .flatMapLatest(drop => drop.file$)

  const image$ = $.merge(
    sources.props$.pluck('image')
      .startWith(null),
      file$.pluck('url'))
    .shareReplay(1)

  const cropProp$ = $.combineLatest(
    sources.props$,
    image$,
    (props, image) => ({...props, image}))

  const crop = Crop({...sources, props$: cropProp$})

  const vtree$ = $.combineLatest(
      drop$.pluck('DOM'),
      crop.DOM,
      image$,
      (d, c, image) => image ? c : d)
    .map(d => div('.image-drop-crop', [d]))

  return {
    DOM: vtree$,
    image$: crop.image$,
  }
}

export default component
