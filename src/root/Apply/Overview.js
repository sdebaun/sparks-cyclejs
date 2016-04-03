import {Observable} from 'rx'
const {just, combineLatest} = Observable

import {
  List,
  ListItemNavigating,
} from 'components/sdm'

import {
  TitleListItem,
} from 'components/ui'

import {div, icon} from 'helpers'

const _Title = sources => TitleListItem({...sources,
  title$: just('Check out these Opportunities!'),
})

const _Item = sources => ListItemNavigating({...sources,
  title$: sources.item$.pluck('name'),
  subtitle$: sources.item$.pluck('description'),
  leftDOM$: just(icon('power','accent')),
  path$: sources.item$.pluck('$key')
    .map(k => '/opp/' + k)
    .map(sources.router.createHref),
})

const _List = sources => List({...sources,
  rows$: sources.opps$,
  Control$: just(_Item),
})

export default sources => {
  const t = _Title(sources)
  const l = _List(sources)
  const childs = [t,l]

  return {
    DOM: combineLatest(childs.map(c => c.DOM), (...doms) => div({},doms)),
    route$: l.route$.share(),
  }
}
