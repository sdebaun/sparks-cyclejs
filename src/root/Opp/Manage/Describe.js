import {Observable} from 'rx'
const {just, combineLatest} = Observable

import isolate from '@cycle/isolate'
import {div, icon} from 'helpers'

import {
  ListItemToggle,
  ListItemCollapsibleTextArea,

} from 'components/sdm'

import {Opps} from 'components/remote'

import {RecruitmentLinkItem} from '../RecruitmentLinkItem'

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
  const preview = isolate(RecruitmentLinkItem)(sources)

  const togglePublic = isolate(TogglePublic)({...sources,
    value$: sources.opp$.pluck('isPublic'),
  })

  const textareaDescription = isolate(TextareaDescription)({...sources,
    value$: sources.opp$.pluck('description'),
  })

  const updateIsPublic$ = togglePublic.value$
    .withLatestFrom(sources.oppKey$, (isPublic,key) =>
      Opps.action.update({key, values: {isPublic}})
    )

  const updateDescription$ = textareaDescription.value$
    .withLatestFrom(sources.oppKey$, (description,key) =>
      Opps.action.update({key, values: {description}})
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
