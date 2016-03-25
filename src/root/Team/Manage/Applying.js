import {Observable} from 'rx'
const {just, combineLatest} = Observable

import isolate from '@cycle/isolate'

import {div} from 'helpers'

import {
  ListItemToggle,
  ListItemCollapsibleTextArea,
} from 'components/sdm'

import {Teams} from 'components/remote'

const ToggleOpen = sources => ListItemToggle({...sources,
  titleTrue$:
    just('This is an Open Team, any volunteer who is accepted can join.'),
  titleFalse$:
    just('This is Restricted, volunteers have to apply to join.'),
})

const TextAreaQuestion = sources => ListItemCollapsibleTextArea({
  ...sources,
  title$:
    just('What question do you want to ask people who apply for this Team?'),
  iconName$: just('playlist_add'),
  okLabel$: just('this sounds great'),
  cancelLabel$: just('hang on ill do this later'),
})

export default sources => {
  const toggle = isolate(ToggleOpen,'open')({...sources,
    value$: sources.team$.pluck('isPublic'),
  })
  const ta = isolate(TextAreaQuestion)({...sources,
    value$: sources.team$.map(({question}) => question || ''),
  })

  const updateQuestion$ = ta.value$
    .withLatestFrom(sources.teamKey$, (question,key) => ({
      key,
      values: {question},
    }))
    .map(Teams.action.update)

  const updatePublic$ = toggle.value$
    .withLatestFrom(sources.teamKey$, (isPublic,key) => ({
      key,
      values: {isPublic},
    }))
    .map(Teams.action.update)

  const queue$ = Observable.merge(
    updateQuestion$,
    updatePublic$,
  )

  const DOM = combineLatest(
    toggle.DOM,
    ta.DOM,
    (...doms) => div({},doms)
  )

  return {
    DOM,
    queue$,
  }
}
