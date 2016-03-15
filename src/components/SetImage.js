import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'
import DropAndCrop from 'components/DropAndCrop'

import {ProjectImages} from 'remote'

// import isolate from '@cycle/isolate'

// import {Opps} from 'remote'

// import OppForm from 'components/OppForm'

import {col, div} from 'helpers'
// import modal from 'helpers/modal'
import listItem from 'helpers/listItem'

// import {log} from 'util'

const _openActions$ = ({DOM}) => Observable.merge(
  DOM.select('.clickable').events('click').scan((a) => !a, false),
)

const _submitAction$ = ({DOM}) =>
  DOM.select('.submit').events('click').map(true)

const _render = ({dataUrl, isOpen, dropAndCrop}) =>
  col(
    listItem({
      iconName: dataUrl ? null : 'add_a_photo',
      iconSrc: dataUrl,
      title: dataUrl ? 'Change your picture.' : 'Choose a picture to use.',
      clickable: true,
    }),
    isOpen && div({},[dropAndCrop])
  )

export default sources => {
  const dropAndCrop = DropAndCrop(sources)

  const submit$ = _submitAction$(sources)

  const queue$ = dropAndCrop.dataUrl$
    .map(dataUrl => ({dataUrl}))
    .withLatestFrom(sources.projectKey$, (values,key) =>
      ProjectImages.set(key,values)
    )

  const isOpen$ = _openActions$(sources)
    .merge(submit$.map(false))
    .startWith(false)

  const viewState = {
    dataUrl$: sources.image$.map(image => image ? image.dataUrl : null),
    isOpen$,
    dropAndCrop: dropAndCrop.DOM,
    cropped$: dropAndCrop.cropped$,
  }

  const DOM = combineLatestObj(viewState).map(_render)

  return {
    DOM,
    queue$,
  }
}
