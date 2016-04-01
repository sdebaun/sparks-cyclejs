import {Observable} from 'rx'
const {just, merge, combineLatest} = Observable

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
  TitleListItem,
  // QuotingListItem,
} from 'components/ui'

// import {log} from 'util'

// const Instruct = sources => TitleListItem({...sources,
//   title$: just('The organizer would like to ask you a question:'),
// })

// const NextStepListItem = sources => ListItemNavigating({
//   title$: sources.show$.flatMapLatest(needed =>
//     needed ? sources.titleNeeded$ : sources.titleDone$
//   ),
//   leftDOM$: sources.isNeeded$.map(needed =>
//     icon(...(needed ? ['check_box_outline','#F00'] : ['check_box']))
//   ),
// })

// const trimTo = (val, len) =>
//   val.length > len ? val.slice(0,len) + '...' : val

const ToDoListItem = sources => {
  const leftDOM$ = sources.isDone$.map(isDone =>
      div({},[
        isDone ?
        icon('check_box','disabled') :
        icon('chevron-circle-right', 'accent'),
      ])
    )

  return ListItemNavigating({...sources,
    leftDOM$,
    classes$: sources.isDone$.map(isDone => ({disabled: isDone})),
  })
}

const _labelMapper = ({isApplied, isAccepted, isConfirmed}) =>
  isApplied && 'You are Waiting to be Accepted.' ||
  isAccepted && 'Confirm Your Spot Now!' ||
  isConfirmed && 'You are Confirmed!'

export default sources => {
  const title = TitleListItem({...sources,
    title$: sources.engagement$.map(_labelMapper),
  })

  const todos = [
    isolate(ToDoListItem,'answer')({...sources,
      title$: just('Answer the application question.'),
      isDone$: sources.engagement$.map(({answer}) => !!answer),
      path$: just(sources.router.createHref('/application/question')),
    }),
    isolate(ToDoListItem,'teams')({...sources,
      title$: just('Choose the Teams you want to be in.'),
      isDone$: sources.memberships$.map(m => m.length > 0),
      path$: just(sources.router.createHref('/application/teams')),
    }),
  ]

  const items = [title, ...todos]
  const route$ = merge(...todos.map(t => t.route$))

  const DOM = combineLatest(
    items.map(i => i.DOM),
    (...doms) => div({}, doms)
  )

  return {
    DOM,
    route$,
  }
}
