import {Observable} from 'rx'
const {just} = Observable

import {Form} from 'components/ui/Form'
import {InputControl} from 'components/sdm'

import {importantTip} from 'helpers'

const InfoBlock = () => ({
  DOM: just(
    importantTip(`
Your email and phone number will only be shared
with organizers that you work with.
    `),
  ),
})

const FullNameInput = sources =>
  InputControl({label$: just('Your Full Name'), ...sources})

const EmailInput = sources =>
  InputControl({label$: just('Your Email Address'), ...sources})

const PhoneInput = sources =>
  InputControl({label$: just('Your Phone Number'), ...sources})

const ProfileForm = sources => Form({
  ...sources,
  Controls$: just([
    {field: 'fullName', Control: FullNameInput},
    {Control: InfoBlock},
    {field: 'email', Control: EmailInput},
    {field: 'phone', Control: PhoneInput},
  ]),
})
export {ProfileForm}
