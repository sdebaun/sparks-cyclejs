import {Observable} from 'rx'
const {just} = Observable
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
  const modalComponent = ModalComponent({
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

export {makeMenuItemPopup}
