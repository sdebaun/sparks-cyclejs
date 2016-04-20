import {Observable} from 'rx'
const {of, merge, combineLatest} = Observable

import isolate from '@cycle/isolate'

import {icon} from 'helpers'

import {
  ListItem,
} from 'components/sdm'

import {
  TitleListItem,
  ToDoListItem,
} from 'components/ui'

import {combineLatestToDiv} from 'util'
// import {log} from 'util'

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
  title$: of('Answer the application question.'),
  isDone$: sources.engagement$.map(({answer}) => !!answer),
  path$: of(sources.router.createHref('/application')),
})

const ToDoTeams = sources => ToDoListItem({...sources,
  title$: of('Choose the Teams you want to be in.'),
  isDone$: sources.memberships$.map(m => m.length > 0),
  path$: of(sources.router.createHref('/application')),
})

const ToDoProfile = sources => ToDoListItem({...sources,
  title$: of('Put some more details in your profile.'),
  isDone$: sources.userProfile$.map(u => u && u.intro && u.skills),
  path$: of('/dash/being'),
})

const Done = sources => ListItem({...sources,
  title$: of('All done!'),
  subtitle$: of(`
    Just wait for the project organizers
    to review your application and Approve you.
  `),
  leftDOM$: of(icon('heart','accent')),
  isVisible$: sources.complete$.map(c => !!c),
})

export default sources => {
  const _sources = {...sources,
    complete$: applicationComplete$$(sources),
  }

  const todos = [
    isolate(ToDoAnswer,'answer')(_sources),
    isolate(ToDoTeams,'teams')(_sources),
    isolate(ToDoProfile,'profile')(_sources),
  ]

  const childs = [Title(_sources), ...todos, Done(_sources)]

  return {
    DOM: combineLatestToDiv(...childs.map(c => c.DOM)),
    route$: merge(...todos.map(t => t.route$)),
  }
}
