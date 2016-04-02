import {sideNav} from 'helpers'
import combineLatestObj from 'rx-combine-latest-obj'

export default sources => {
  const close$ = sources.DOM.select('.close-sideNav').events('click').map(false)

  const DOM = combineLatestObj({
    isMobile: sources.isMobile$,
    isOpen: sources.isOpen$.merge(close$),
    content: sources.contentDOM,
  }).map(sideNav)

  return {
    DOM,
  }
}
