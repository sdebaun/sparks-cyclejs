import {Observable as $} from 'rx'
import {div} from 'helpers'

import {FetchEngagements} from '../FetchEngagements'

import {
  List,
} from 'components/sdm'

import {Item} from './Item'

const AppList = sources => List({...sources,
  Control$: $.of(Item),
  rows$: sources.confirmed$,
})

export default sources => {
  const _sources = {...sources, ...FetchEngagements(sources)}
  const list = AppList(_sources)

  return {
    pageTitle: $.of('Confirmed Volunteers'),
    tabBarDOM: $.of(div('',[])),
    DOM: list.DOM,
  }
}
