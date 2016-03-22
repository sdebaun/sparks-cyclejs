import {Observable} from 'rx'
const {just, merge} = Observable
import combineLatestObj from 'rx-combine-latest-obj'

import {col, div} from 'helpers'
import listItem from 'helpers/listItem'
import menuItem from 'helpers/menuItem'
import {DropdownMenu} from 'components/DropdownMenu'

// import {log} from 'util'

const _openActions$ = ({DOM}) => Observable.merge(
  DOM.select('.clickable').events('click').map(() => true),
)

// const waiver =
//   menuItem({
//     iconName: 'calendar-check-o',
//     title: 'A signed liability waiver',
//     iconBackgroundColor: 'red',
//     className: 'give.waiver',
//   })

const shifts =
  menuItem({
    iconName: 'calendar2',
    title: 'One or more shifts',
    className: 'give.shifts',
  })

const payment =
  menuItem({
    iconName: 'banknote',
    title: 'A payment',
    className: 'give.payment',
  })

const deposit =
  menuItem({
    iconName: 'ticket',
    title: 'A refundable deposit',
    className: 'give.deposit',
  })

const _render = ({dropdownDOM, giveWaiverModalDOM}) =>
  col(
    listItem({
      iconName: 'plus',
      title: 'What do Volunteers GIVE?',
      iconBackgroundColor: 'yellow',
      clickable: true,
    }),
    dropdownDOM,
    giveWaiverModalDOM,
  )

import {makeMenuItemPopup} from 'components/ui'
import makeInputControl from 'components/InputControlFactory'

const WhoInput = makeInputControl({
  label: 'Who is being helped?',
  className: 'help',
})

const GiveWaiverForm = sources => {
  const whoInput = WhoInput(sources)

  const item$ = combineLatestObj({
    who$: whoInput.value$,
  })

  const viewState = {
    whoInputDOM: whoInput.DOM,
  }

  const DOM = combineLatestObj(viewState).map(({whoInputDOM}) =>
    col(whoInputDOM)
  )

  return {
    DOM,
    item$,
  }
}

const GiveWaiverItemPopup = makeMenuItemPopup({
  iconName: 'event_available',
  title: 'A Liability Waiver',
  className: 'waiver',
})

const makeMenuItemFormPopup = ({FormControl, ItemControl}) => sources => {
  const form = FormControl(sources)
  const control = ItemControl({contentDOM$: form.DOM, ...sources})

  const item$ = form.item$
    .sample(control.submit$)

  return {
    itemDOM: control.itemDOM,
    modalDOM: control.modalDOM,
    submit$: control.submit$,
    item$,
  }
}

const GiveWaiver = makeMenuItemFormPopup({
  FormControl: GiveWaiverForm,
  ItemControl: GiveWaiverItemPopup,
})

export const AddCommitmentGive = sources => {
  const giveWaiver = GiveWaiver(sources)

  const children$ = just([div({},[
    giveWaiver.itemDOM,
    shifts,
    payment,
    deposit,
  ])])

  const isOpen$ = _openActions$(sources).startWith(false)
    .merge(giveWaiver.submit$.map(false))

  const dropdown = DropdownMenu({...sources, isOpen$, children$})

  const viewState = {
    dropdownDOM$: dropdown.DOM,
    giveWaiverModalDOM$: giveWaiver.modalDOM,
  }

  const DOM = combineLatestObj(viewState).map(_render)

  const commitment$ = merge(
    giveWaiver.commitment$,
  ).map(c => ({party: 'vol', ...c}))

  return {
    DOM,
    isOpen$,
    commitment$,
  }
}
