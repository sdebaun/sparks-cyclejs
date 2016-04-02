// TODO: convert makeMenuItemFormPopup

import {Observable} from 'rx'
const {just, merge, combineLatest} = Observable

import {div} from 'helpers'
import {Menu} from 'components/sdm'

import {
  ListItemClickable,
} from 'components/sdm'

import {
  GetHelp,
  GetTicket,
  GetTracked,
  GetSchwag,
} from './GetItems'

const SelectingItem = sources => ListItemClickable({...sources,
  title$: just('What do Volunteers GET?'),
  iconName$: just('plus'),
  classes$: just({header: true}),
})

export const AddCommitmentGet = sources => {
  const selecting = SelectingItem(sources)
  const getHelp = GetHelp(sources)
  const getTicket = GetTicket(sources)
  const getTracked = GetTracked(sources)
  const getSchwag = GetSchwag(sources)

  const children = [
    getHelp,
    getTicket,
    getTracked,
    getSchwag,
  ]

  const menuItemDOMs$ = just([div({},
    children.map(c => c.itemDOM)
  )])

  const modalDOMs$ = just(
    children.map(c => c.modalDOM)
  )

  const submits$ = merge(...children.map(c => c.submit$))

  const isOpen$ = sources.DOM.select('.clickable').events('click')
  // const isOpen$ = selecting.click$ //????
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
    getHelp.item$.sample(getHelp.submit$)
      .map(c => ({...c, code: 'help'})),
    getTicket.item$.sample(getTicket.submit$)
      .map(c => ({...c, code: 'ticket'})),
    getTracked.item$.sample(getTracked.submit$)
      .map(c => ({...c, code: 'tracked'})),
    getSchwag.item$.sample(getSchwag.submit$)
      .map(c => ({...c, code: 'schwag'})),
  ).map(c => ({...c, party: 'org'}))

  return {
    DOM,
    isOpen$,
    commitment$,
  }
}
