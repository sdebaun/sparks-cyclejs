import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'
import DropAndCrop from 'components/DropAndCrop'
import {col} from 'helpers'
import {ProjectImages} from 'remote'
import {button, h4} from 'cycle-snabbdom'

const _render = ({dropAndCrop, cropped}) =>
  col(
    h4({style: {marginTop: '0.25em'}}, cropped ?
      'Please crop your project image as you would prefer' : ''),
    dropAndCrop
  )

function Photo(sources) {
  const dropAndCrop = DropAndCrop(sources)
  const queue$ = dropAndCrop.dataUrl$
    .withLatestFrom(sources.projectKey$, ProjectImages.create)

  const viewState = {
    dropAndCrop: dropAndCrop.DOM,
    cropped$: dropAndCrop.cropped$,
  }

  const DOM = combineLatestObj(viewState).map(_render)
  return {DOM, queue$}
}

export default Photo
