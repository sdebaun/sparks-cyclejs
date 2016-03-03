import {Observable} from 'rx'
import Tabs from 'components/Tabs'

const _DOM = ({createHref, tabs}) =>
  Tabs({}, tabs.map(({path,label}) =>
    Tabs.Tab({id: label, link: createHref(path)},label)
  ))

export default sources => {
  const navigate$ = sources.DOM.select('.tab-label-content').events('click')
    .map(event => event.ownerTarget.dataset.link)
    .distinctUntilChanged()

  const DOM = Observable.combineLatest(
    sources.tabs,
    (tabs) => ({createHref: sources.router.createHref, tabs}),
  ).map(_DOM)

  return {
    DOM,
    route$: navigate$,
  }
}
