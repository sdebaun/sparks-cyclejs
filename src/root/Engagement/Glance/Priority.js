import {Observable} from 'rx'
const {just, merge, combineLatest} = Observable

import isolate from '@cycle/isolate'

import {div} from 'helpers'

import {
  TitleListItem,
  QuotingListItem,
  ToDoListItem,
} from 'components/ui'

// import {log} from 'util'

const Title = sources => TitleListItem({...sources,
  title$: sources.engagement$.map(({isApplied, isAccepted, isConfirmed}) =>
    isApplied && 'You are Waiting to be Accepted.' ||
    isAccepted && 'Confirm Your Spot Now!' ||
    isConfirmed && 'You are Confirmed!'
  ),
})

const Quote = sources => QuotingListItem({...sources,
  title$: sources.project$.pluck('description'),
  profileKey$: sources.project$.pluck('ownerProfileKey'),
})

const ToDoAnswer = sources => ToDoListItem({...sources,
  title$: just('Answer the application question.'),
  isDone$: sources.engagement$.map(({answer}) => !!answer),
  path$: just(sources.router.createHref('/application/question')),
})

const ToDoTeams = sources => ToDoListItem({...sources,
  title$: just('Choose the Teams you want to be in.'),
  isDone$: sources.memberships$.map(m => m.length > 0),
  path$: just(sources.router.createHref('/application/teams')),
})

export default sources => {
  const todos = [
    isolate(ToDoAnswer,'answer')(sources),
    isolate(ToDoTeams,'teams')(sources),
  ]

  const children = [
    Title(sources),
    Quote(sources),
    ...todos,
  ]

  const route$ = merge(...todos.map(t => t.route$))

  const DOM = combineLatest(
    children.map(i => i.DOM),
    (...doms) => div({}, doms)
  )

  return {
    DOM,
    route$,
  }
}
