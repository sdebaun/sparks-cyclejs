import combineLatestObj from 'rx-combine-latest-obj'
import {div} from 'cycle-snabbdom'

import AppMenu from 'components/AppMenu'
import {Appbar} from 'snabbdom-material'
import {icon} from 'helpers'
import {material} from 'util'

const _DOM = ({
  isMobile,
  labelText = 'No Label',
  subLabelText = '',
  tabsDOM,
}) =>
  div({style: {backgroundColor: '#666', color: '#FFF', minHeight: '80px'}},[
    div({style: {padding: '0.5em', lineHeight: '48px'}},[
      isMobile && Appbar.Button({className: 'nav-button'}, [icon('menu')]),
      div({style: {lineHeight: '24px'}},[
        div({style: {fontSize: '18px', fontWeight: 'bold'}},[labelText]),
        div({style: {fontSize: '14px'}},[subLabelText]),
      ]),
    ]),
    isMobile ? tabsDOM : null,
  ])

export default ({isMobile$, labelText$, subLabelText$, tabsDOM$}) => {
  const DOM = combineLatestObj({
    isMobile$, labelText$, subLabelText$, tabsDOM$,
  }).map(_DOM)

  return {DOM}
}

