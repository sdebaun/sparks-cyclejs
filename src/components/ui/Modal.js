import combineLatestObj from 'rx-combine-latest-obj'
import modal from 'helpers/modal'

const _submitAction$ = ({DOM}) =>
  DOM.select('.submit').events('click').map(true)

const makeModal = ({title, iconName, submitLabel = 'OK', closeLabel = 'CANCEL'}) =>
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

    const submit$ = _submitAction$(sources)

    const isOpen$ = sources.isOpen$
      .merge(submit$.map(false))

    const viewState = {
      isOpen$,
      contentDOM$: sources.contentDOM$,
    }

    const DOM = combineLatestObj(viewState).map(_modalRender)

    return {
      DOM,
      submit$,
    }
  }

export {makeModal}
