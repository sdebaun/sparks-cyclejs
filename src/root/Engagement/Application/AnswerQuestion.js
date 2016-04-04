import {Observable} from 'rx'
const {of} = Observable

import isolate from '@cycle/isolate'

import {icon} from 'helpers'

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

import {combineLatestToDiv, trimTo} from 'util'
// import {log} from 'util'

const Instruct = sources => ListItem({...sources,
  title$: of('The organizer would like to ask you a question:'),
})

const Question = sources => QuotingListItem({...sources,
  title$: sources.opp$.map(({question}) => question || 'No Question'),
  profileKey$: sources.project$.pluck('ownerProfileKey'),
})

const Answer = sources => ListItemCollapsibleTextArea({...sources,
  title$: sources.answer$.map(a => a ?
    'You gave the answer:' :
    'Give a good answer that will help the organizer get to know you.'
  ),
  subtitle$: sources.answer$.map(a => a ? trimTo(a,60) : null),
  isOpen$: sources.answer$.map(a => !a),
  iconName$: of('playlist_add'),
  value$: sources.answer$.map(a => a || ''),
})

const Next = sources => ListItemNavigating({...sources,
  title$: of('Next, pick the teams you want to join.'),
  leftDOM$: of(icon('chevron-circle-right', 'accent')),
  path$:
    sources.engagementKey$.map(k => '/engaged/' + k + '/application/teams'),
  isVisible$: sources.answer$.map(a => !!a),
})

const buildUpdate = (key$, values$) =>
  values$.withLatestFrom(key$, (values, key) => ({key, values}))

export default sources => {
  const _sources = {...sources,
    answer$: sources.engagement$.map(e => e && e.answer),
  }

  const inst = Instruct(_sources)
  const quest = Question(_sources)
  const ans = isolate(Answer,'answer')(_sources)
  const next = isolate(Next, 'next')(_sources)

  const childs = [inst, quest, ans, next]

  const queue$ = buildUpdate(
    sources.engagementKey$,
    ans.value$.map(answer => ({answer})),
  ).map(Engagements.action.update)

  const DOM = combineLatestToDiv(...childs.map(i => i.DOM))

  return {
    DOM,
    queue$,
    route$: next.route$,
  }
}
