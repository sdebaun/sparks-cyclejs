import {Observable} from 'rx'
const {merge, just} = Observable

import combineLatestObj from 'rx-combine-latest-obj'

import {Mask, getScreenSize} from 'snabbdom-material'
import {div} from 'cycle-snabbdom'

require('./styles.scss')

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

const style = {
  delayed: {
    opacity: '1',
  },
  remove: {
    opacity: '0',
  },
}

const Menu = sources => {
  const isOpen$ = merge(
    sources.isOpen$,
    sources.DOM.select('.close').events('click').map(() => false),
  ).startWith(false)

  const viewState = {
    children$: sources.children$,
    isOpen$,
    leftAlign$: sources.leftAlign$ || just(true),
  }

  const DOM = combineLatestObj(viewState)
    .map(({isOpen, children, leftAlign}) =>
      div('.menu', [
        Mask({className: 'close', dark: false, isOpen}),
        isOpen ? div('.menu-contents.paper1', {
          style,
          hook: {insert},
          class: {left: leftAlign, right: !leftAlign},
        }, children) : null,
      ])
    )

  return {
    DOM,
  }
}

export {Menu}
