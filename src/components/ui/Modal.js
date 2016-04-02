// TODO: exterminate

import {Observable} from 'rx'
const {merge} = Observable

import combineLatestObj from 'rx-combine-latest-obj'
import modal from 'helpers/modal'

const makeModal = ({
  title,
  iconName,
  submitLabel = 'OK',
  closeLabel = 'CANCEL',
}) =>
  sources => {
    const _modalRender = ({isOpen, contentDOM}) =>
      modal({
        isOpen,
        title,
        iconName,
        submitLabel,
        closeLabel,
        content: contentDOM,
      })

    const submit$ = sources.DOM.select('.submit').events('click')

    const close$ = sources.DOM.select('.close').events('click')

    const isOpen$ = merge(
      sources.isOpen$,
      submit$.map(false),
      close$.map(false),
    )

    const viewState = {
      isOpen$,
      contentDOM$: sources.contentDOM$,
    }

    const DOM = combineLatestObj(viewState).map(_modalRender)

    return {
      DOM,
      submit$,
      close$,
    }
  }

export {makeModal}
