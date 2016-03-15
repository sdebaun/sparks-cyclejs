import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'
import {col} from 'helpers'
// import listItem from 'helpers/listItem'

import makeToggleListItem from 'components/ToggleListItemFactory'
import makeTextareaListItem from 'components/TextareaListItemFactory'

import {Opps} from 'remote'

const _render = ({togglePublicDOM, textareaDescriptionDOM}) =>
  col(
    togglePublicDOM,
    textareaDescriptionDOM,
    // listItem({
    //   iconName: 'playlist_add',
    //   title: 'Write a short tweet-length description.',
    //   subtitle: 'Coming Soon!',
    //   disabled: true,
    // }),
  )

const TogglePublic = makeToggleListItem({
  labelTrue: 'This is a Public Opportunity, and anyone can apply.',
  labelFalse: 'This is Private, and is only seen by people you invite.',
})

const TextareaDescription = makeTextareaListItem({
  iconName: 'playlist_add',
  title: 'Write a short tweet-length description.',
})

export default sources => {
  const togglePublic = TogglePublic({
    value$: sources.opp$.pluck('isPublic'),
    ...sources,
  })

  const textareaDescription = TextareaDescription({
    value$: sources.opp$.pluck('description'),
    ...sources,
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
