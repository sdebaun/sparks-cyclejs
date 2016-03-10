import {div, span} from 'cycle-snabbdom'
import {Mask} from 'snabbdom-material'
import {icon} from 'helpers'
import {material} from 'util'

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

export function sideNav({isMobile, isOpen, content}) {
  if (isMobile && isOpen) {
    return renderSideNav({}, [content])
  }
  return isMobile ? span({}, []) : div({}, [content])
}
