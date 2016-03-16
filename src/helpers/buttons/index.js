import {span} from 'cycle-snabbdom'
import {Dialog} from 'snabbdom-material'

const Button = Dialog.Button

require('./styles.scss')

export const submitAndCancel = (submitLabel, cancelLabel) =>
  span({},[
    Button({onClick: true, primary: true, className: 'submit'},[submitLabel]),
    Button({onClick: true, flat: true, className: 'cancel'},[cancelLabel]),
  ])

export const centeredSignup = () =>
  span({class: {signup: true}},[
    Button({onClick: true, primary: true, className: 'facebook'},['Sign up with Facebook']),
    Button({onClick: true, primary: true, className: 'google'},['Sign up with Google']),
  ])
