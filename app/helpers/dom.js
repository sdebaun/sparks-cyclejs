import React from 'react'
import ReactDOM from 'react-dom'
import {div} from 'cycle-snabbdom'
import {Icon} from 'snabbdom-material'

// helper function to attach react components to the snabbdom
// some need to be attached on 'update', others on 'insert', not sure why
// see Dropper.js and Cropper.js
export const reactComponent = (Klass,attrs,hookName = 'update') =>
  div({
    hook: {[hookName]: ({elm}) => ReactDOM.render(<Klass {...attrs}/>,elm)},
  })

// brevity etc
export const icon = (name,color) => Icon({name,style: {color: '#FFF'}})

// app-wide material styles
export const material = {
  primaryColor: '#666',
  primaryFontColor: 'rgba(255, 255, 255, 0.9)',
  primaryFontColorDisabled: 'rgba(0, 0, 0, 0.45)',
  primaryLightWaves: false,
  secondaryColor: '#009688',
  secondaryFontColor: 'rgba(255, 255, 255, 0.9)',
  secondaryFontColorDisabled: 'rgba(255, 255, 255, 0.6)',
  secondaryLightWaves: true,
  errorColor: '#C00',
  successColor: '#090',
  typographyColor: '#212121',

  sidenav: {
    width: '280px',
    left: '-290px',
    transition: 'left .3s ease-out',
    delayed: {
      left: '0',
    },
    remove: {
      left: '-290px',
    },
  },

  fadeInOut: {
    opacity: '0',
    transition: 'opacity .3s',
    delayed: {
      opacity: '1',
    },
    remove: {
      opacity: '0',
    },
  },
}
