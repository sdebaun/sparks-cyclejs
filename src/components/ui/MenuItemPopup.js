/* no cycle-hmr */
// TODO: exterminate

import {Observable} from 'rx'
const {just} = Observable
import isolate from '@cycle/isolate'
// import {log} from 'util'

import {makeModal} from 'components/ui'
import menuItem from 'helpers/menuItem'

const makeMenuItemPopup = ({iconName, title, className}) => sources => {
  const isOpen$ = sources.DOM.select('.' + className).events('click')
    .map(true)
    // .merge(modalComponent.submit$.map(false))
    // .merge(modalComponent.close$.map(false))
    .startWith(false)

  const ModalComponent = makeModal({title, icon: iconName})
  const modalComponent = isolate(ModalComponent)({
    isOpen$,
    ...sources,
  })

  const submit$ = modalComponent.submit$

  const itemDOM = just(
    menuItem({iconName, title, className, clickable: true}),
  )

  const modalDOM = modalComponent.DOM

  return {
    itemDOM,
    modalDOM,
    submit$,
  }
}

const makeMenuItemFormPopup = ({
  FormControl,
  title = 'No Title',
  iconName,
  className,
}) => sources => {
  const ItemControl = makeMenuItemPopup({title, iconName, className})

  const form = isolate(FormControl)(sources)
  const control = ItemControl({contentDOM$: form.DOM, ...sources})

  const item$ = form.item$

  return {
    itemDOM: control.itemDOM,
    modalDOM: control.modalDOM,
    submit$: control.submit$.share(),
    item$,
  }
}

export {
  makeMenuItemPopup,
  makeMenuItemFormPopup,
}
