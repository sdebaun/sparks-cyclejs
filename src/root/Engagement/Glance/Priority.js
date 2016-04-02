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

const applicationComplete$$ = sources => combineLatest(
  sources.engagement$.map(({answer}) => !!answer),
  sources.memberships$.map(m => m.length > 0),
  (ans, len) => ans && len,
)

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

const ToDoApp = sources => ToDoListItem({...sources,
  title$: just('Complete your Application.'),
  isDone$: applicationComplete$$(sources),
  path$: just(sources.router.createHref('/application')),
})

export default sources => {
  const todos = [
    isolate(ToDoApp,'app')(sources),
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
