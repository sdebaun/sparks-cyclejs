import {Mask, getScreenSize} from 'snabbdom-material'
import {div} from 'cycle-snabbdom'

const insert = (vnode) => {
  const {height: screenHeight} = getScreenSize()
  const {top, bottom} = vnode.elm.getBoundingClientRect()
  const originalHeight = bottom - top
  const minHeight = 32 * 8 + 20

  let offsetTop = top < 6 ? Math.ceil((top - 16) / -32) * 32 : 0
  const offsetBottom = bottom > screenHeight - 6 ?
    Math.ceil((bottom - screenHeight + 16) / 32) * 32 : 0
  let height = bottom - top - offsetTop - offsetBottom
  if (height < minHeight) {
    height = minHeight > originalHeight ? originalHeight : minHeight
    if (top + offsetTop + height + 16 > screenHeight) {
      offsetTop -= top + offsetTop + height + 16 - screenHeight
    }
  }
  vnode.elm.style.top = `${vnode.elm.offsetTop + offsetTop}px`
  vnode.elm.style.height = `${height}px`
  vnode.elm.scrollTop += offsetTop
}

const containerStyle = {
  zIndex: '1000',
  position: 'relative',
  height: '0',
  overflow: 'visible',
}

const menuStyle = {
  zIndex: '1001',
  padding: '10px 0',
  backgroundColor: '#fff',
  color: '#000',
  position: 'absolute',
  overflowY: 'auto',
  scrollbar: 'width: 4px',
  top: '-8px',
  opacity: '0',
  transition: `opacity 0.3s`,
  delayed: {
    opacity: '1',
  },
  remove: {
    opacity: '0',
  },
}

function menu(config, children) {
  const {isOpen, rightAlign, style: styles = {}} = config

  const style = Object.assign(menuStyle, styles, rightAlign ? {right: '0'} : {})

  return div('.app-menu', {style: containerStyle}, [
    Mask({className: 'close-menu', dark: false, isOpen}),
    isOpen ? div('.paper-1', {hook: {insert}, style}, children) : null,
  ])
}

export {menu}
