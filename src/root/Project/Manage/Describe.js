import combineLatestObj from 'rx-combine-latest-obj'
import {col} from 'helpers'

import SetImage from 'components/SetImage'

const _render = ({setImageDOM}) =>
  col(
    setImageDOM,
  )

function Photo(sources) {
  const setImage = SetImage({image$: sources.projectImage$, ...sources})

  const queue$ = setImage.queue$

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
