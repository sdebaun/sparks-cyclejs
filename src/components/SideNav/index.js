import {div, span} from 'cycle-snabbdom'
import {Mask} from 'snabbdom-material'
import {icon} from 'helpers'
import {material} from 'util'
import combineLatestObj from 'rx-combine-latest-obj'

const defaultStyles = {
  zIndex: '1001',
  position: 'fixed',
  top: '0',
  bottom: '0',
  overflow: 'auto',
}

function renderSideNav(config, children) {
  const {className = '', style: userStyle = {}} = config
  const classes = ['sidenav', 'paper2', className].filter(Boolean)
  const style = Object.assign(defaultStyles, userStyle, material.sidenav)
  return div({},[
    Mask({isOpen: true, material, className: 'close-sideNav'}),
    div(`.${classes.join('.')}`, {style}, [
      span({}, children),
    ]),
  ])
}

export default sources => {
  const close$ = sources.DOM.select('.close-sideNav').events('click')
    .map(false)

  const _DOM = ({isMobile,isOpen,contentDOM}) =>
    isMobile && isOpen && renderSideNav({}, [contentDOM]) ||
      (!isMobile && div({},[contentDOM]) || span(''))

  const DOM = combineLatestObj({
    isMobile$: sources.isMobile$,
    isOpen$: sources.isOpen$.merge(close$),
    contentDOM$: sources.contentDOM,
  }).map(_DOM)

  return {
    DOM,
  }
}
