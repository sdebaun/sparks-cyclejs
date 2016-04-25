import {Observable as $} from 'rx'

import isolate from '@cycle/isolate'

import {icon} from 'helpers'
import {hideable} from 'util'

import {
  TitledCard,
  ListItem,
} from 'components/sdm'

import {
  TitleListItem,
  ToDoListItem,
} from 'components/ui'

import {combineLatestToDiv} from 'util'
// import {log} from 'util'

const Title = sources => TitleListItem({...sources,
  title$: sources.isApplicationComplete$.map(complete => complete ?
    'Your Application is being reviewed.' :
    'Complete your Application!'
  ),
})

const ToDoAnswer = sources => ToDoListItem({...sources,
  title$: $.of('Answer the application question.'),
  isDone$: sources.engagement$.map(({answer}) => !!answer),
  path$: $.of(sources.router.createHref('/application')),
})

const ToDoTeams = sources => ToDoListItem({...sources,
  title$: $.of('Choose the Teams you want to be in.'),
  isDone$: sources.memberships$.map(m => m.length > 0),
  path$: $.of(sources.router.createHref('/application')),
})

const ToDoProfile = sources => ToDoListItem({...sources,
  title$: $.of('Put some more details in your profile.'),
  isDone$: sources.userProfile$.map(u => u && u.intro && u.skills),
  path$: $.of('/dash/being'),
})

const Done = sources => ListItem({...sources,
  title$: $.of('All done!'),
  subtitle$: $.of(`
    Just wait for the project organizers
    to review your application and Approve you.
  `),
  leftDOM$: $.of(icon('heart','accent')),
  isVisible$: sources.isApplicationComplete$.map(c => !!c),
})

const NextStepsList = sources => {
  const todos = [
    isolate(ToDoAnswer,'answer')(sources),
    isolate(ToDoTeams,'teams')(sources),
    isolate(ToDoProfile,'profile')(sources),
  ]

  const childs = [Title(sources), ...todos, Done(sources)]

  return {
    DOM: combineLatestToDiv(...childs.map(c => c.DOM)),
    route$: $.merge(...todos.map(t => t.route$)),
  }
}

export const CardApplicationNextSteps = sources => {
  const ns = NextStepsList(sources)
  const card = hideable(TitledCard)({...sources,
    elevation$: $.just(2),
    isVisible$: sources.engagement$.map(e => e.isApplied && !e.isAccepted),
    title$: $.just('Awaiting Approval'),
    content$: $.just([ns.DOM]),
  })

  return {
    DOM: card.DOM,
    route$: ns.route$,
  }
}

