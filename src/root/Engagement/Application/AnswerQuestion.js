import {Observable} from 'rx'
const {just, combineLatest} = Observable

import isolate from '@cycle/isolate'

import {div, icon} from 'helpers'

import {
  Engagements,
} from 'components/remote'

import {
  ListItem,
  ListItemNavigating,
  ListItemCollapsibleTextArea,
} from 'components/sdm'

import {
  QuotingListItem,
} from 'components/ui'

// import {log} from 'util'

const Instruct = sources => ListItem({...sources,
  title$: just('The organizer would like to ask you a question:'),
})

// const NextStepListItem = sources => ListItemNavigating({
//   title$: sources.show$.flatMapLatest(needed =>
//     needed ? sources.titleNeeded$ : sources.titleDone$
//   ),
//   leftDOM$: sources.isNeeded$.map(needed =>
//     icon(...(needed ? ['check_box_outline','#F00'] : ['check_box']))
//   ),
// })

const trimTo = (val, len) =>
  val.length > len ? val.slice(0,len) + '...' : val

export default sources => {
  const answer$ = sources.engagement$.map(e => e && e.answer)

  const ictrl = Instruct(sources)
  const qctrl = QuotingListItem({...sources,
    title$: sources.opp$.map(({question}) => question || 'No Question'),
    profileKey$: sources.project$.pluck('ownerProfileKey'),
  })
  const actrl = isolate(ListItemCollapsibleTextArea,'answer')({...sources,
    title$: answer$.map(a => a ?
      'You gave the answer:' :
      'Give a good answer that will help the organizer get to know you.'
    ),
    subtitle$: answer$.map(a => a ? trimTo(a,60) : null),
    isOpen$: answer$.map(a => !a),
    iconName$: just('playlist_add'),
    value$: answer$.map(a => a || ''),
  })
  const next = isolate(ListItemNavigating,'next')({...sources,
    title$: just('Next, pick the teams you want to join.'),
    leftDOM$: just(icon('chevron-circle-right', 'accent')),
    path$:
      sources.engagementKey$.map(k => '/engaged/' + k + '/application/teams'),
  })

  const items = [
    ictrl,
    qctrl,
    actrl,
  ]

  const queue$ = actrl.value$
    .withLatestFrom(sources.engagementKey$, (answer,key) => ({
      key, values: {answer},
    }))
    .map(Engagements.action.update)

  const DOM = combineLatest(
    answer$, next.DOM,
    ...items.map(i => i.DOM),
    (answer, nextDOM, ...doms) => div({},[
      ...doms,
      answer ? nextDOM : null,
    ])
  )

  return {
    DOM,
    queue$,
    route$: next.route$,
  }
}
