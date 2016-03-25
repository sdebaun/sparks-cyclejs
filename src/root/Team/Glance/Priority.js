import {Observable} from 'rx'
const {just, merge, combineLatest} = Observable

import isolate from '@cycle/isolate'

import {div} from 'helpers'

import {
  ListItemNavigating,
} from 'components/sdm'

const WhatItem = sources => ListItemNavigating({...sources,
  title$: just('What\'s this Team all about?'),
  iconName$: just('users'),
  path$: just('/manage'),
})

const InviteItem = sources => ListItemNavigating({...sources,
  title$: just('Invite some people to Lead this Team'),
  iconName$: just('person_add'),
  path$: just('/manage/leads'),
})

const HowItem = sources => ListItemNavigating({...sources,
  title$: just('How are volunteers joining this Team?'),
  iconName$: just('event_note'),
  path$: just('/manage/applying'),
})

export default sources => {
  const what = isolate(WhatItem,'what')(sources)
  const invite = isolate(InviteItem,'invite')(sources)
  const how = isolate(HowItem,'how')(sources)

  const items = [what, invite, how]

  const route$ = merge(...items.map(i => i.route$))
    .map(sources.router.createHref)

  const DOM = combineLatest(
    ...items.map(i => i.DOM),
    (...doms) => div({},doms)
  )

  return {
    DOM,
    // queue$,
    route$,
  }
}
