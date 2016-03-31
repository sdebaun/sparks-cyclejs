import {Observable} from 'rx'
const {just, combineLatest} = Observable

import isolate from '@cycle/isolate'

import {div} from 'helpers'

import {
  List,
  ListItem,
  ListItemClickable,
  ListItemHeader,
  CheckboxControl,
  TextAreaControl,
  OkAndCancel,
} from 'components/sdm'

import {
  Memberships,
  Fulfillers,
  Teams,
} from 'components/remote'

import {TeamIcon} from 'components/team'

// const WhatItem = sources => ListItemNavigating({...sources,
//   title$: just('What\'s this Team all about?'),
//   iconName$: just('users'),
//   path$: just('/manage'),
// })

// const InviteItem = sources => ListItemNavigating({...sources,
//   title$: just('Invite some people to Lead this Team'),
//   iconName$: just('person_add'),
//   path$: just('/manage/leads'),
// })

// const HowItem = sources => ListItemNavigating({...sources,
//   title$: just('How are volunteers joining this Team?'),
//   iconName$: just('event_note'),
//   path$: just('/manage/applying'),
// })

const Instruct = sources => ListItem({...sources,
  title$: just('Choose one or more Teams that you want to join.'),
})

const TeamMemberLookup = sources => ({
  found$: sources.memberships$.combineLatest(
    sources.teamKey$,
    (memberships, key) =>
      memberships.find(({$key, teamKey}) => key === teamKey ? $key : false)
  ),
})

const FulfillerMemberListItem = sources => {
  const teamKey$ = sources.item$.pluck('teamKey')
  const team$ = teamKey$
    .flatMapLatest(Teams.query.one(sources))

  const membership$ = TeamMemberLookup({...sources, teamKey$}).found$

  const cb = CheckboxControl({...sources, value$: membership$})

  const li = ListItemClickable({...sources,
    leftDOM$: TeamIcon({...sources, teamKey$}).DOM,
    title$: team$.pluck('name'),
    rightDOM$: cb.DOM,
  })

  // li.click$.subscribe(log('click$'))
  // fulfiller$.subscribe(log('fulfiller$'))

  const queue$ = membership$
    .sample(li.click$)
    .combineLatest(
      teamKey$,
      // sources.teamKey$,
      sources.userProfileKey$,
      sources.engagementKey$,
      (membership, teamKey, oppKey, engagementKey) =>
        membership && membership.$key ?
        Memberships.action.remove(membership.$key) :
        Memberships.action.create({teamKey, oppKey, engagementKey}),
    )

  return {
    DOM: li.DOM,
    queue$,
  }
}

const TeamsMembersList = sources => {
  const header = ListItemHeader({...sources,
    title$: just('Available Teams'),
    rightDOM$: just('x'),
  })

  const list = List({...sources,
    Control$: just(FulfillerMemberListItem),
  })

  const DOM = sources.rows$.combineLatest(
    header.DOM,
    list.DOM,
    (rows, ...restDOM) =>
      div({}, rows.length > 0 ? restDOM : []),
  )

  return {
    DOM,
    queue$: list.queue$,
  }
}

export default sources => {
  const oppKey$ = sources.engagement$.pluck('oppKey')

  const memberships$ = oppKey$
    .flatMapLatest(Memberships.query.byOpp(sources))

  const fulfillers$ = oppKey$
    .flatMapLatest(Fulfillers.query.byOpp(sources))

  const list = TeamsMembersList({...sources,
    rows$: fulfillers$,
    memberships$,
  })

  const ictrl = Instruct(sources)
  // const qctrl = Question({...sources,
  //   title$: sources.opp$.map(({question}) => question || 'No Question'),
  // })
  // const answer = ListItemTextArea({...sources,
  //   value$: sources.engagement$.map(e => e ? e.answer : ''),
  // })

  const items = [
    ictrl,
    list,
    // qctrl,
    // answer,
  ]

  // const route$ = merge(...items.map(i => i.route$))
  //   .map(sources.router.createHref)

  const DOM = combineLatest(
    ...items.map(i => i.DOM),
    (...doms) => div({},doms)
  )

  return {
    DOM,
    queue$: list.queue$,
    // route$,
  }
}
