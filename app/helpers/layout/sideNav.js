import {div, span} from 'cycle-snabbdom'
import {Mask} from 'snabbdom-material'
import {material} from 'helpers/dom'

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
  return div(`.${classes.join('.')}`, {style}, [
    span({}, children),
  ])
}

function sideNav(config, children) {
  const {isOpen} = config
  return div({style: {zIndex: '1000'}}, [
    Mask({isOpen, material, className: 'close-sideNav'}),
    isOpen ? renderSideNav(config, children) : span({}, []),
  ])
}

export {sideNav}
