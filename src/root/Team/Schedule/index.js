import {Observable} from 'rx'
const {of} = Observable

import {TabbedPage} from 'components/ui'
import Overview from './Overview'
import ComingSoon from 'components/ComingSoon'

function getPathParts(pathname) {
  return pathname.split('/').filter(Boolean)
}

function hasShifts(pathname) {
  return getPathParts(pathname).indexOf('shifts') !== -1
}

function makeTabTitle(pathname) {
  const pathParts = getPathParts(pathname)
  const date = pathParts[pathParts.length - 1]
  return {path: `/shifts/${date}`, label: date}
}

function makeTabs(pathname) {
  return [
    {path: '/', label: 'Overview'},
    makeTabTitle(pathname),
  ]
}

export default sources => {
  const pathname$ = sources.router.observable.pluck('pathname')
  const tabs$ = pathname$
    .filter(hasShifts)
    .map(makeTabs)
    .startWith([{path: '/', label: 'Overview'}])

  const routes$ = of({
    '/': Overview,
    '/shifts/:date': date => _sources => ComingSoon('Shifts')(_sources),
  })

  return {
    pageTitle: of('Schedule'),
    ...TabbedPage({...sources, tabs$, routes$}),
  }
}
