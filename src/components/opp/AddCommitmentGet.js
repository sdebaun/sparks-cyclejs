// TODO: convert makeMenuItemFormPopup

import {Observable} from 'rx'
const {just, merge, combineLatest} = Observable

import {div} from 'helpers'
import {Menu} from 'components/sdm'

import {Form, makeMenuItemFormPopup} from 'components/ui'
import {
  InputControl,
  ListItemClickable,
} from 'components/sdm'

// import {log} from 'util'

import codeIcons from 'components/opp/codeIcons'

// SCHWAG

const SchwagWhatInput = sources => InputControl({...sources,
  label$: just('What will they get?'),
})

const GetSchwagForm = sources => Form({...sources,
  Controls$: just([{field: 'what', Control: SchwagWhatInput}]),
})

const GetSchwag = makeMenuItemFormPopup({
  FormControl: GetSchwagForm,
  title: 'Cool Schwag',
  iconName: codeIcons['schwag'],
  className: 'schwag',
})

// TRACKED

const TrackedCountInput = sources => InputControl({...sources,
  label$: just('How many are they getting?'),
})

const TrackedDescriptionInput = sources => InputControl({...sources,
  label$: just('What are they getting?'),
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

const EventCodeInput = sources => InputControl({...sources,
  label$: just('What is your Eventbrite Event Code?'),
})

const TicketTypeInput = sources => InputControl({...sources,
  label$: just('What is your Eventbrite Ticket Type?'),
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

const HelpWhoInput = sources => InputControl({...sources,
  label$: just('Who are they helping?'),
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

const SelectingItem = sources => ListItemClickable({...sources,
  title$: just('What do Volunteers GET?'),
  iconName$: just('plus'),
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
    getHelp.item$.map(c => ({...c, code: 'help'})),
    getTicket.item$.map(c => ({...c, code: 'ticket'})),
    getTracked.item$.map(c => ({...c, code: 'tracked'})),
    getSchwag.item$.map(c => ({...c, code: 'schwag'})),
  ).map(c => ({...c, party: 'org'}))

  return {
    DOM,
    isOpen$,
    commitment$,
  }
}
