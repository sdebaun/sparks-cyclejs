import React from 'react'
import ReactDOM from 'react-dom'
import {div} from 'cycle-snabbdom';
import { Icon } from 'snabbdom-material'

// helper function to attach react components to the snabbdom
// some components need to be attached on 'update' hook, others on 'insert', not sure why
// see Dropper.js and Cropper.js
export const reactComponent = (Klass,attrs,hookName='update')=>
  div({
    hook: { [hookName]: ({elm})=> ReactDOM.render(<Klass {...attrs}/>,elm) }
  })

export const icon = name=>Icon({name})