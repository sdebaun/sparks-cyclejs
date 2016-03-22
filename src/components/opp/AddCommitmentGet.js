import {Observable} from 'rx'
const {just, merge} = Observable
import combineLatestObj from 'rx-combine-latest-obj'

import {div} from 'helpers'
import listItem from 'helpers/listItem'
import {DropdownMenu} from 'components/DropdownMenu'

import {Form, makeMenuItemFormPopup} from 'components/ui'
import makeInputControl from 'components/InputControlFactory'

// import {log} from 'util'

import codeIcons from 'components/opp/codeIcons'

// SCHWAG

const SchwagWhoInput = makeInputControl({
  label: 'What will they get?',
  className: 'schwag',
})

const GetSchwagForm = sources => Form({...sources,
  Controls$: just([{field: 'what', Control: SchwagWhoInput}]),
})

const GetSchwag = makeMenuItemFormPopup({
  FormControl: GetSchwagForm,
  title: 'Cool Schwag',
  iconName: codeIcons['schwag'],
  className: 'schwag',
})

// TRACKED

const TrackedCountInput = makeInputControl({
  label: 'How many are they getting?',
  className: 'tracked-count',
})

const TrackedDescriptionInput = makeInputControl({
  label: 'What are they getting?',
  className: 'tracked-description',
})

const GetTrackedForm = sources => Form({...sources,
  Controls$: just([
    {field: 'count', Control: TrackedCountInput},
    {field: 'description', Control: TrackedDescriptionInput},
  ]),
})

const GetTracked = makeMenuItemFormPopup({
  FormControl: GetTrackedForm,
  title: 'Tracked consumables',
  iconName: codeIcons['tracked'],
  className: 'tracked',
})

// TICKET

const EventCodeInput = makeInputControl({
  label: 'What is your Eventbrite Event Code?',
  className: 'event-code',
})

const TicketTypeInput = makeInputControl({
  label: 'What is your Eventbrite Ticket Type?',
  className: 'ticket-type',
})

const GetTicketForm = sources => Form({...sources,
  Controls$: just([
    {field: 'eventCode', Control: EventCodeInput},
    {field: 'ticketType', Control: TicketTypeInput},
  ]),
})

const GetTicket = makeMenuItemFormPopup({
  FormControl: GetTicketForm,
  title: 'A Ticket to an event',
  iconName: codeIcons['ticket'],
  className: 'ticket',
})

// HELP

const HelpWhoInput = makeInputControl({
  label: 'Who are they helping?',
  className: 'help',
})

const GetHelpForm = sources => Form({...sources,
  Controls$: just([{field: 'who', Control: HelpWhoInput}]),
})

const GetHelp = makeMenuItemFormPopup({
  FormControl: GetHelpForm,
  title: 'To help a community',
  iconName: codeIcons['help'],
  className: 'help',
})

const _render = ({dropdownDOM, modalDOMs}) =>
  div({},[
    listItem({
      iconName: 'plus',
      title: 'What do Volunteers GET?',
      iconBackgroundColor: 'yellow',
      clickable: true,
    }),
    dropdownDOM,
    ...modalDOMs,
  ])

export const AddCommitmentGet = sources => {
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
    .map(true)
    .merge(submits$.map(false))
    .startWith(false)

  const dropdown = DropdownMenu({...sources, isOpen$, children$: menuItemDOMs$})

  const viewState = {
    dropdownDOM$: dropdown.DOM,
    modalDOMs$,
  }

  const DOM = combineLatestObj(viewState).map(_render)

  const commitment$ = merge(
    getHelp.item$.map(c => ({...c, code: 'help'})),
    getTicket.item$.map(c => ({...c, code: 'pass'})),
    getTracked.item$.map(c => ({...c, code: 'tracked'})),
    getSchwag.item$.map(c => ({...c, code: 'schwag'})),
  ).map(c => ({...c, party: 'org'}))

  return {
    DOM,
    isOpen$,
    commitment$,
  }
}
