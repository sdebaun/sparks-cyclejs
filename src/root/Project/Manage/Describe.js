// import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'
import {col} from 'helpers'
// import {button, h4} from 'cycle-snabbdom'
// import {byMatch} from 'util'

import SetImage from 'components/SetImage'

// const _responseRedirects$ = ({
//   responses$,
//   projectKey$,
// }) => {
//   const newImageResponse$ =
//     responses$.filter(byMatch('ProjectImages','set'))

//   const newImageRedirect$ = projectKey$
//     .sample(newImageResponse$)
//     .map(projectKey => '/project/' + projectKey)

//   return newImageRedirect$
// }

const _render = ({setImageDOM}) =>
  col(
    setImageDOM,
    // h4({style: {marginTop: '0.25em'}}, cropped ?
    //   'Please crop your project image as you would prefer' : ''),
    // dropAndCrop
  )

function Photo(sources) {
  const setImage = SetImage({image$: sources.projectImage$, ...sources})

  const queue$ = setImage.queue$

  // const route$ = _responseRedirects$(sources)

  const viewState = {
    setImageDOM: setImage.DOM,
    // dropAndCrop: dropAndCrop.DOM,
    // cropped$: dropAndCrop.cropped$,
  }

  const DOM = combineLatestObj(viewState).map(_render)
  return {
    DOM,
    queue$,
    // route$,
  }
}

export default Photo
