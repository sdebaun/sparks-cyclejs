// TODO: convert makeMenuItemFormPopup

import {Observable} from 'rx'
const {just, merge, combineLatest} = Observable

import {div} from 'helpers'
import {Menu} from 'components/sdm'

import {ListItemClickable} from 'components/sdm'
import {GiveWaiver, GiveShifts, GivePayment, GiveDeposit} from './GiveItems'

const SelectingItem = sources => ListItemClickable({...sources,
  title$: just('What do Volunteers GIVE?'),
  iconName$: just('plus'),
})

export const AddCommitmentGive = sources => {
  const selecting = SelectingItem(sources)
  const giveWaiver = GiveWaiver(sources)
  const giveDeposit = GiveDeposit(sources)
  const givePayment = GivePayment(sources)
  const giveShifts = GiveShifts(sources)

  const children = [
    giveWaiver,
    giveShifts,
    givePayment,
    giveDeposit,
  ]

  const menuItemDOMs$ = just([div({},
    children.map(c => c.itemDOM)
  )])

  const modalDOMs$ = just(
    children.map(c => c.modalDOM)
  )

  const submits$ = merge(...children.map(c => c.submit$))

  const isOpen$ = sources.DOM.select('.clickable').events('click')
    .map(true)
    .merge(submits$.map(false))
    .startWith(false)

  const dropdown = Menu({...sources, isOpen$, children$: menuItemDOMs$})

  const DOM = combineLatest(
    modalDOMs$,
    selecting.DOM,
    dropdown.DOM,
    (modals, ...rest) => div({},[...rest, ...modals])
  )

  const commitment$ = merge(
    giveWaiver.item$.sample(giveWaiver.submit$).map(c => ({...c, code: 'waiver'})),
    giveDeposit.item$.sample(giveDeposit.submit$).map(c => ({...c, code: 'deposit'})),
    givePayment.item$.sample(givePayment.submit$).map(c => ({...c, code: 'payment'})),
    giveShifts.item$.sample(giveShifts.submit$).map(c => ({...c, code: 'shifts'})),
  ).map(c => ({...c, party: 'vol'}))

  return {
    DOM,
    isOpen$,
    commitment$,
  }
}
