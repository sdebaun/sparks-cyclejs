import {Observable} from 'rx'
import tabs, {tab} from 'helpers/tabs'
import {log} from 'util'

const _DOM = createHref => _tabs =>
  tabs({}, _tabs.map(({path,label}) =>
    tab({id: label, link: createHref(path)},label)
  ))

export default sources => {
  const navigate$ = sources.DOM.select('.tab-label-content').events('click')
    .map(event => event.ownerTarget.dataset.link)
    .distinctUntilChanged()

  const DOM = sources.tabs.map(_DOM(sources.router.createHref))

  navigate$.subscribe(log('tabs.navigate$'))

  return {
    DOM,
    route$: navigate$,
  }
}
