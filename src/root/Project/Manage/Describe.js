import combineLatestObj from 'rx-combine-latest-obj'
import {col} from 'helpers'
import listItem from 'helpers/listItem'

import SetImage from 'components/SetImage'

import {ProjectImages} from 'components/remote'

// import {log} from 'util'

const _render = ({setImageDOM}) =>
  col(
    listItem({
      iconName: 'playlist_add',
      title: 'Write a short tweet-length description.',
      subtitle: 'Coming Soon!',
      disabled: true,
    }),
    setImageDOM,
  )

function Photo(sources) {
  const setImage = SetImage({...sources,
    image$: sources.projectImage$,
  })

  const queue$ = setImage.dataUrl$
    .withLatestFrom(
      sources.projectKey$,
      (dataUrl,key) => ({key, values: {dataUrl}})
    )
    .map(ProjectImages.action.set)

  const viewState = {
    setImageDOM: setImage.DOM,
  }

  const DOM = combineLatestObj(viewState).map(_render)
  return {
    DOM,
    queue$,
  }
}

export default Photo
