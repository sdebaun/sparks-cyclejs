import {div} from 'helpers'
import {icon} from 'helpers'

const ToggleControl = sources => ({
  click$: sources.DOM.select('.toggle').events('click'),

  DOM: sources.value$.map(v =>
    div({class: {toggle: true}},[
      v ?
      icon('toggle-on','accent') :
      icon('toggle-off'),
    ])
  ),
})

export {ToggleControl}
