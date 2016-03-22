import {Observable} from 'rx'
const {just, merge} = Observable
import combineLatestObj from 'rx-combine-latest-obj'

import {col, div} from 'helpers'
import listItem from 'helpers/listItem'
import menuItem from 'helpers/menuItem'
import {DropdownMenu} from 'components/DropdownMenu'

import {log} from 'util'

const _openActions$ = ({DOM}) => Observable.merge(
  DOM.select('.clickable').events('click').map(() => true),
)

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

// const deposit =
//   menuItem({
//     iconName: 'ticket',
//     title: 'A refundable deposit',
//     className: 'give.deposit',
//   })

const _render = ({dropdownDOM, giveWaiverModalDOM, giveDepositModalDOM}) =>
  col(
    listItem({
      iconName: 'plus',
      title: 'What do Volunteers GIVE?',
      iconBackgroundColor: 'yellow',
      clickable: true,
    }),
    dropdownDOM,
    giveWaiverModalDOM,
    giveDepositModalDOM,
  )

import {makeMenuItemFormPopup} from 'components/ui'
import makeInputControl from 'components/InputControlFactory'

const WhoInput = makeInputControl({
  label: 'Who is being helped?',
  className: 'help',
})

const Form = sources => {
  // sources.Controls$ is an array of components

  // controls$ is array of the created components (sink collections technically)
  const controls$ = sources.Controls$.map(Controls =>
    Controls.map(({field,Control}) => ({field, control: Control(sources)}))
  )

  // item$ gets their values$
  const item$ = controls$.flatMapLatest(controls =>
    combineLatestObj(
      controls.reduce((a, {field,control}) =>
        (a[field] = control.value$) && a, {}
      )
    )
  )

  const DOM = controls$.map(controls =>
    div({}, controls.map(({control}) => control.DOM))
  )

  return {
    DOM,
    item$,
  }
}

const GiveWaiverForm = sources => {
  const Controls$ = just([
    {field: 'who', Control: WhoInput},
  ])

  return Form({...sources, Controls$})
}

const OldGiveWaiverForm = sources => {
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

const GiveDepositForm = sources => {
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

const GiveWaiver = makeMenuItemFormPopup({
  FormControl: GiveWaiverForm,
  title: 'A Liability Waiver',
  iconName: 'event_available',
  className: 'waiver',
})

const GiveDeposit = makeMenuItemFormPopup({
  FormControl: GiveDepositForm,
  title: 'A refundable deposit',
  iconName: 'ticket',
  className: 'give.deposit',
})

export const AddCommitmentGive = sources => {
  const giveWaiver = GiveWaiver(sources)
  const giveDeposit = GiveDeposit(sources)

  const children$ = just([div({},[
    giveWaiver.itemDOM,
    shifts,
    payment,
    giveDeposit.itemDOM,
  ])])

  const isOpen$ = _openActions$(sources).startWith(false)
    .merge(giveWaiver.submit$.map(false))
    .merge(giveDeposit.submit$.map(false))

  const dropdown = DropdownMenu({...sources, isOpen$, children$})

  const viewState = {
    dropdownDOM$: dropdown.DOM,
    giveWaiverModalDOM$: giveWaiver.modalDOM,
    giveDepositModalDOM$: giveDeposit.modalDOM,
  }

  const DOM = combineLatestObj(viewState).map(_render)

  const commitment$ = merge(
    giveWaiver.item$.map(c => ({...c, code: 'waiver'})),
    giveDeposit.item$.map(c => ({...c, code: 'deposit'})),
  ).map(c => ({...c, party: 'vol'}))

  return {
    DOM,
    isOpen$,
    commitment$,
  }
}
