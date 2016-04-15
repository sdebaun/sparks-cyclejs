import {Observable} from 'rx'
const {just, merge, combineLatest} = Observable

import isolate from '@cycle/isolate'

import {div, icon} from 'helpers'

import {
  TitleListItem,
  QuotingListItem,
  ToDoListItem,
} from 'components/ui'

import {
  ListItemNavigating,
} from 'components/sdm'

// import {log} from 'util'

const applicationComplete$$ = sources => combineLatest(
  sources.engagement$.map(({answer}) => !!answer),
  sources.memberships$.map(m => m.length > 0),
  (ans, len) => ans && len,
)

const Title = sources => TitleListItem({...sources,
  title$: sources.engagement$.map(({isApplied, isAccepted, isConfirmed}) =>
    isApplied && !isAccepted && 'You are Waiting to be Accepted.' ||
    isAccepted && !isConfirmed && 'Confirm Your Spot Now!' ||
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

const Confirm = sources => ListItemNavigating({...sources,
  path$: sources.engagementKey$.map(e => '/engaged/' + e + '/schedule'),
  leftDOM$: just(icon('heart', 'yellow')),
  title$: just('Click here to confirm your spot!'),
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

  const confirm = Confirm(sources)

  const route$ = merge(confirm.route$, ...todos.map(t => t.route$))

  const DOM = combineLatest(
    sources.engagement$, ...children.map(i => i.DOM),
    ({isAccepted}, ...doms) => isAccepted ?
      div({}, [doms[0], confirm.DOM]) :
      div({}, doms)
  )

  return {
    DOM,
    route$,
  }
}
