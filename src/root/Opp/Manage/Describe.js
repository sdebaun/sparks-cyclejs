import {Observable} from 'rx'
const {just} = Observable

import isolate from '@cycle/isolate'
import combineLatestObj from 'rx-combine-latest-obj'
import {col} from 'helpers'

import {ListItemToggle} from 'components/sdm'

import makeTextareaListItem from 'components/TextareaListItemFactory'

import {Opps} from 'remote'

const _render = ({togglePublicDOM, textareaDescriptionDOM}) =>
  col(
    togglePublicDOM,
    textareaDescriptionDOM,
  )

const TogglePublic = sources => ListItemToggle({...sources,
  titleTrue$: just('This is a Public Opportunity, and anyone can apply.'),
  titleFalse$: just('This is Private, and is only seen by people you invite.'),
})

const TextareaDescription = makeTextareaListItem({
  iconName: 'playlist_add',
  title: 'Write a short tweet-length description.',
  maxLength: '140',
})

export default sources => {
  // isolate breaks this!??! @tylors
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

  const viewState = {
    togglePublicDOM: togglePublic.DOM,
    textareaDescriptionDOM: textareaDescription.DOM,
  }

  const DOM = combineLatestObj(viewState).map(_render)
  return {
    DOM,
    queue$,
  }
}
