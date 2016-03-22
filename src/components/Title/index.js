import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'
import {div} from 'cycle-snabbdom'

import {Appbar} from 'snabbdom-material'
import {icon} from 'helpers'

const style = (backgroundUrl) => ({
  backgroundImage: backgroundUrl &&
    'linear-gradient(rgba(0,0,0,0.60),rgba(0,0,0,0.90)), url(' + backgroundUrl + ')' ||
    'linear-gradient(rgba(0,0,0,0.80),rgba(0,0,0,0.80))',
  zIndex: 0,
  color: 'white',
  minHeight: '80px',
  backgroundSize: 'cover',
})

const _DOM = ({
  isMobile,
  backgroundUrl,
  labelText = 'No Label',
  subLabelText = '',
  quickNavDOM,
  tabsDOM,
}) =>
  div({style: style(backgroundUrl)},[
    quickNavDOM,
    div({style: {padding: '0.5em', lineHeight: '48px'}},[
      isMobile && Appbar.Button({className: 'nav-button'}, [icon('menu')]),
      div({style: {lineHeight: '24px'}},[
        div({style: {fontSize: '18px', fontWeight: 'bold'}},[labelText]),
        div({style: {fontSize: '14px'}},[subLabelText]),
      ]),
    ]),
    isMobile ? tabsDOM : null,
  ])

export default ({
  isMobile$, labelText$, subLabelText$, tabsDOM$, quickNavDOM$,
}) => {
  const DOM = combineLatestObj({
    isMobile$,
    labelText$,
    subLabelText$: subLabelText$ || Observable.just(null),
    tabsDOM$: tabsDOM$ || Observable.just(null),
    quickNavDOM$: quickNavDOM$ || Observable.just(null),
  }).map(_DOM)

  return {DOM}
}

