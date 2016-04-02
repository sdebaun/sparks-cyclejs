import {Observable} from 'rx'
const {just, merge, combineLatest} = Observable

import isolate from '@cycle/isolate'

import {div, icon} from 'helpers'

import {
  ListItem,
} from 'components/sdm'

import {
  TitleListItem,
  ToDoListItem,
} from 'components/ui'

import {log} from 'util'

const applicationComplete$$ = sources => combineLatest(
  sources.engagement$.map(({answer}) => !!answer),
  sources.memberships$.map(m => m.length > 0),
  (ans, len) => ans && len,
)

const Title = sources => TitleListItem({...sources,
  title$: sources.complete$.map(complete => complete ?
    'Your Application is being reviewed.' :
    'Complete your Application!'
  ),
})

const ToDoAnswer = sources => ToDoListItem({...sources,
  title$: just('Answer the application question.'),
  isDone$: sources.engagement$.map(({answer}) => !!answer),
  path$: just(sources.router.createHref('/question')),
})

const ToDoTeams = sources => ToDoListItem({...sources,
  title$: just('Choose the Teams you want to be in.'),
  isDone$: sources.memberships$.map(m => m.length > 0),
  path$: just(sources.router.createHref('/teams')),
})

const ToDoProfile = sources => ToDoListItem({...sources,
  title$: just('Put some more details in your profile.'),
  isDone$: sources.userProfile$.map(u => u && u.intro && u.skills),
  path$: just('/dash/being'),
})

const Done = sources => ListItem({...sources,
  title$: just('All done!'),
  subtitle$: just(`
    Just wait for the project organizers
    to review your application and Approve you.
  `),
  leftDOM$: just(icon('heart','accent')),
})

export default sources => {
  const complete$ = applicationComplete$$(sources)

  const todos = [
    isolate(ToDoAnswer,'answer')({...sources, complete$}),
    isolate(ToDoTeams,'teams')({...sources, complete$}),
    isolate(ToDoProfile,'profile')({...sources, complete$}),
  ]

  const children = [
    Title({...sources, complete$}),
    ...todos,
  ]

  const route$ = merge(...todos.map(t => t.route$))

  complete$.subscribe(log('complete$'))

  const DOM = combineLatest(
    ...children.map(i => i.DOM),
    complete$.map(c => c ? Done(sources).DOM : null),
    (...doms) => div({}, doms)
  )

  return {
    DOM,
    route$,
  }
}
