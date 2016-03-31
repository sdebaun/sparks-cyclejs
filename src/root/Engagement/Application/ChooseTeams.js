import {Observable} from 'rx'
const {just, combineLatest} = Observable

import isolate from '@cycle/isolate'

import {div} from 'helpers'

import {
  ListItem,
  TextAreaControl,
  OkAndCancel,
} from 'components/sdm'

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

const ListItemTextArea = sources => {
  const ta = TextAreaControl(sources)
  const oac = OkAndCancel(sources)
  const li = ListItem({...sources,
    title$: combineLatest(ta.DOM, oac.DOM, (...doms) => div({},doms)),
  })

  return {
    DOM: li.DOM,
    value$: ta.value$.sample(oac.ok$),
  }
}

const Instruct = sources => ListItem({...sources,
  title$: just('Choose one or more Teams you want to join'),
})

// add formatting etc, ultimate QuoteItem that uses profile
const Question = sources => ListItem({...sources})

export default sources => {
  const ictrl = Instruct(sources)
  // const qctrl = Question({...sources,
  //   title$: sources.opp$.map(({question}) => question || 'No Question'),
  // })
  // const answer = ListItemTextArea({...sources,
  //   value$: sources.engagement$.map(e => e ? e.answer : ''),
  // })

  const items = [
    ictrl,
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
    // queue$,
    // route$,
  }
}
