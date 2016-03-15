import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'
import {col} from 'helpers'
import listItem from 'helpers/listItem'

import makeToggleListItem from 'components/ToggleListItemFactory'

import {Opps} from 'remote'

// import SetImage from 'components/SetImage'

const _render = ({togglePublicDOM}) =>
  col(
    togglePublicDOM,
    listItem({
      iconName: 'playlist_add',
      title: 'Write a short tweet-length description.',
      subtitle: 'Coming Soon!',
      disabled: true,
    }),
  )

const TogglePublic = makeToggleListItem({
  label: 'This is a toggle',
})

export default sources => {
  const togglePublic = TogglePublic({
    value$: sources.opp$.pluck('isPublic'),
    ...sources,
  })
  // const setImage = SetImage({image$: sources.projectImage$, ...sources})

  // const queue$ = setImage.queue$

  const queue$ = togglePublic.value$
    .withLatestFrom(sources.oppKey$, (isPublic,key) =>
      Opps.update(key,{isPublic})
    )

  const viewState = {
    togglePublicDOM: togglePublic.DOM,
  }

  const DOM = combineLatestObj(viewState).map(_render)
  // const DOM = Observable.just(['page'])
  // const DOM = Observable.just(_render())
  return {
    DOM,
    queue$,
  }
}
