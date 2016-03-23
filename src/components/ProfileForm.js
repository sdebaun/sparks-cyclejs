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

// // // import {Observable} from 'rx'
// import combineLatestObj from 'rx-combine-latest-obj'
// import {col, importantTip} from 'helpers'
// // // import isolate from '@cycle/isolate'

// // // import {log} from 'util'

// // import makeInputControl from 'components/InputControlFactory'

// const _render = ({
//   fullNameDOM, emailDOM, phoneDOM, zipDOM,
// }) =>
//   col(
//     fullNameDOM,
//     importantTip(`
// Your email and phone number will only be shared
// with organizers that you work with.
//     `),
//     emailDOM,
//     phoneDOM,
//     zipDOM,
//   )

// // const FullNameInput = makeInputControl({
// //   label: 'Your Full Name',
// //   className: 'fullName',
// // })
// // const EmailInput = makeInputControl({
// //   label: 'Your Email Address',
// //   className: 'email',
// // })
// // const PhoneInput = makeInputControl({
// //   label: 'Your Phone Number',
// //   className: 'phone',
// // })
// // // const ZipInput = makeInputControl({
// // //   label: 'Your ZIP or Postal Code',
// // //   className: 'zip',
// // // })

// const isEmail = () => true

// const xProfileForm = sources => {
//   const fullNameInput =
//     FullNameInput({...sources, value$: sources.item$.pluck('fullName')})

//   const emailInput =
//     EmailInput({...sources, value$: sources.item$.pluck('email')})

//   const phoneInput =
//     PhoneInput({...sources, value$: sources.item$.pluck('phone')})

//   // const zipInput =
//   //   ZipInput({...sources, value$: sources.profile$.pluck('zip')})

//   // const profile$ = combineLatestObj({
//   const item$ = combineLatestObj({
//     fullName$: fullNameInput.value$,
//     email$: emailInput.value$,
//     phone$: phoneInput.value$,
//     // zip$: zipInput.value$,
//   })

//   // const valid$ = profile$
//   const valid$ = item$
//     .map(({fullName,email,phone}) =>
//       !!fullName && !!email && !!phone &&
//       isEmail(email)
//     )

//   const viewState = {
//     profile$: item$,
//     fullNameDOM$: fullNameInput.DOM,
//     emailDOM$: emailInput.DOM,
//     phoneDOM$: phoneInput.DOM,
//     // zipDOM$: zipInput.DOM,
//   }

//   const DOM = combineLatestObj(viewState).map(_render)

//   // return {DOM, profile$, valid$}
//   return {DOM, item$, valid$}
// }

export {ProfileForm}
