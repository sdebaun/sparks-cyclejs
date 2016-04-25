import {Observable as $} from 'rx'
import {div} from 'helpers'
import {combineDOMsToDiv} from 'util'

import {FetchEngagements} from '../FetchEngagements'

import {
  List,
} from 'components/sdm'

import {
  TitleListItem,
} from 'components/ui'

import {Item} from './Item'

const _Header = sources => TitleListItem({...sources,
  title$: sources.confirmed$
    .map(arr => `You have ${arr.length} Confirmed Volunteers.`),
})

const AppList = sources => List({...sources,
  Control$: $.of(Item),
  rows$: sources.confirmed$,
})

export default sources => {
  const _sources = {...sources, ...FetchEngagements(sources)}
  const hdr = _Header(_sources)
  const list = AppList(_sources)

  return {
    pageTitle: $.of('Confirmed Volunteers'),
    tabBarDOM: $.of(div('',[])),
    DOM: combineDOMsToDiv('',hdr,list),
    queue$: list.queue$,
  }
}
