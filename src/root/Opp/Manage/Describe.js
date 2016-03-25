import {Observable} from 'rx'
const {just, combineLatest} = Observable

import isolate from '@cycle/isolate'
import combineLatestObj from 'rx-combine-latest-obj'
import {col, div} from 'helpers'

import {
  ListItemToggle,
  ListItemCollapsibleTextArea,
  ListItemNavigating,
} from 'components/sdm'

import {Opps} from 'remote'

const _render = ({togglePublicDOM, textareaDescriptionDOM}) =>
  col(
    togglePublicDOM,
    textareaDescriptionDOM,
  )

const PreviewRecruiting = sources => ListItemNavigating({...sources,
  title$: just('Preview your Recruiting page.'),
  iconName$: just('remove'),
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
  title$: just('Write a short tweet-length description'),
  iconName$: just('playlist_add'),
  okLabel$: just('this sounds great'),
  cancelLabel$: just('hang on ill do this later'),
})

export default sources => {
  const preview = PreviewRecruiting(sources)

  const togglePublic = TogglePublic({...sources,
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

  // const viewState = {
  //   togglePublicDOM: togglePublic.DOM,
  //   textareaDescriptionDOM: textareaDescription.DOM,
  // }

  // const DOM = combineLatestObj(viewState).map(_render)
  return {
    DOM,
    queue$,
    route$: preview.route$,
  }
}
