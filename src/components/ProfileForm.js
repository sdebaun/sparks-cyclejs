import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'
import {Input,Select} from 'snabbdom-material'
import {col, importantTip} from 'helpers'
import isolate from '@cycle/isolate'

import {log} from 'util'

import makeInputControl from 'components/InputControlFactory'

const _render = ({
  fullNameDOM, emailDOM, phoneDOM, zipDOM,
}) =>
  col(
    fullNameDOM,
    importantTip(`
Your email and phone number will only be shared
with organizers that you work with.
    `),
    emailDOM,
    phoneDOM,
    zipDOM,
  )

const FullNameInput = makeInputControl({
  label: 'Your Full Name',
  className: 'fullName',
})
const EmailInput = makeInputControl({
  label: 'Your Email Address',
  className: 'email',
})
const PhoneInput = makeInputControl({
  label: 'Your Phone Number',
  className: 'phone',
})
const ZipInput = makeInputControl({
  label: 'Your ZIP or Postal Code',
  className: 'zip',
})

const isEmail = cand => true

export default sources => {
  const fullNameInput =
    FullNameInput({...sources, value$: sources.profile$.pluck('fullName')})

  const emailInput =
    EmailInput({...sources, value$: sources.profile$.pluck('email')})

  const phoneInput =
    PhoneInput({...sources, value$: sources.profile$.pluck('phone')})

  const zipInput =
    ZipInput({...sources, value$: sources.profile$.pluck('zip')})

  const profile$ = combineLatestObj({
    fullName$: fullNameInput.value$,
    email$: emailInput.value$,
    phone$: phoneInput.value$,
    // zip$: zipInput.value$,
  })

  const valid$ = profile$
    .map(({fullName,email,phone}) =>
      !!fullName && !!email && !!phone &&
      isEmail(email)
    )

  const viewState = {
    profile$,
    fullNameDOM$: fullNameInput.DOM,
    emailDOM$: emailInput.DOM,
    phoneDOM$: phoneInput.DOM,
    // zipDOM$: zipInput.DOM,
  }

  const DOM = combineLatestObj(viewState).map(_render)

  return {DOM, profile$, valid$}
}
