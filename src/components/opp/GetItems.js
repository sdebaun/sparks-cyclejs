import {Observable} from 'rx'
const {just} = Observable

import codeIcons from 'components/opp/codeIcons'
import {Form, makeMenuItemFormPopup} from 'components/ui'
import {InputControl} from 'components/sdm'

// SCHWAG

const SchwagWhatInput = sources => InputControl({...sources,
  label$: just('What will they get?'),
})

const GetSchwagForm = sources => Form({...sources,
  Controls$: just([{field: 'what', Control: SchwagWhatInput}]),
})

export const GetSchwag = makeMenuItemFormPopup({
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

export const GetTracked = makeMenuItemFormPopup({
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

export const GetTicket = makeMenuItemFormPopup({
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

export const GetHelp = makeMenuItemFormPopup({
  FormControl: GetHelpForm,
  title: 'To help a community',
  iconName: codeIcons['help'],
  className: 'help',
})
