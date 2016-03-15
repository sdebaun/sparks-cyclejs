import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'
import DropAndCrop from 'components/DropAndCrop'
import {col} from 'helpers'
import {ProjectImages} from 'remote'
import {button, h4} from 'cycle-snabbdom'

import {byMatch} from 'util'

const _responseRedirects$ = ({
  responses$,
  projectKey$,
  router: {createHref},
}) => {
  const newImageResponse$ =
    responses$.filter(byMatch('ProjectImages','set'))

  const newImageRedirect$ = projectKey$
    .sample(newImageResponse$)
    .map(projectKey => '/project/' + projectKey)

  return newImageRedirect$
}

const _render = ({dropAndCrop, cropped}) =>
  col(
    h4({style: {marginTop: '0.25em'}}, cropped ?
      'Please crop your project image as you would prefer' : ''),
    dropAndCrop
  )

function Photo(sources) {
  const dropAndCrop = DropAndCrop(sources)
  const queue$ = dropAndCrop.dataUrl$
    .map(dataUrl => ({dataUrl}))
    .withLatestFrom(sources.projectKey$, (values,key) =>
      ProjectImages.set(key,values)
    )

  const route$ = _responseRedirects$(sources)

  const viewState = {
    dropAndCrop: dropAndCrop.DOM,
    cropped$: dropAndCrop.cropped$,
  }

  const DOM = combineLatestObj(viewState).map(_render)
  return {DOM, queue$, route$}
}

export default Photo
