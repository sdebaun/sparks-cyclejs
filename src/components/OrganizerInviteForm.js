import {Observable} from 'rx'
const {just} = Observable

import {Form} from 'components/ui/Form'
import {InputControl, SelectControl} from 'components/sdm'

const EmailInput = sources =>
  InputControl({label$: just('Send to Email'), ...sources})

const authorityOptions = [
  {value: 'manager', label: 'Manager'},
  {value: 'owner', label: 'Owner'},
]

const AuthoritySelect = sources => SelectControl({...sources,
  label$: just('What kind of Organizer?'),
  options$: just(authorityOptions),
})

const OrganizerInviteForm = sources => Form({
  ...sources,
  Controls$: just([
    {field: 'inviteEmail', Control: EmailInput},
    {field: 'authority', Control: AuthoritySelect},
  ]),
})

export {OrganizerInviteForm}
