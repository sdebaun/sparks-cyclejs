import {icon} from 'helpers'

const CheckboxControl = sources => ({
  DOM: sources.value$.map(v =>
    v ?
    icon('check_box','accent') :
    icon('check_box_outline_blank')
  ),
})

export {CheckboxControl}
