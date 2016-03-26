import {Observable} from 'rx'
const {just, combineLatest} = Observable

import isolate from '@cycle/isolate'
import {div, icon} from 'helpers'

import {
  ListItemToggle,
  ListItemCollapsibleTextArea,
  ListItemNavigating,
} from 'components/sdm'

import {Opps} from 'remote'

const PreviewRecruiting = sources => ListItemNavigating({...sources,
  title$: just('View your Recruiting page.'),
  iconName$: just('link'),
  path$: combineLatest(
    sources.projectKey$, sources.oppKey$,
    (pk, ok) => '/apply/' + pk + '/opp/' + ok
  ),
})

const TogglePublic = sources => ListItemToggle({...sources,
  titleTrue$: just('This is a Public Opportunity, and anyone can apply.'),
  titleFalse$: just('This is Private, and is only seen by people you invite.'),
})

const TextareaDescription = sources => ListItemCollapsibleTextArea({
  ...sources,
  title$: just('Describe this Opportunity to applicants.'),
  subtitle$: just(`
    Tell your prospective volunteers what they\'re going to acheive,
    and how rewarding it will be.
  `),
  leftDOM$: just(icon('playlist_add')),
  // iconName$: just('playlist_add'),
  okLabel$: just('this sounds great'),
  cancelLabel$: just('hang on ill do this later'),
})

export default sources => {
  const preview = isolate(PreviewRecruiting)(sources)

  const togglePublic = isolate(TogglePublic)({...sources,
    value$: sources.opp$.pluck('isPublic'),
  })

  const textareaDescription = isolate(TextareaDescription)({...sources,
    value$: sources.opp$.pluck('description'),
  })

  const updateIsPublic$ = togglePublic.value$
    .withLatestFrom(sources.oppKey$, (isPublic,key) =>
      Opps.update(key,{isPublic})
    )

  const updateDescription$ = textareaDescription.value$
    .withLatestFrom(sources.oppKey$, (description,key) =>
      Opps.update(key,{description})
    )

  const queue$ = Observable.merge(
    updateIsPublic$,
    updateDescription$,
  )

  const DOM = combineLatest(
    preview.DOM,
    togglePublic.DOM,
    textareaDescription.DOM,
    (...doms) => div({}, doms)
  )

  return {
    DOM,
    queue$,
    route$: preview.route$,
  }
}
