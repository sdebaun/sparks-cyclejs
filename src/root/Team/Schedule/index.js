import {Observable} from 'rx'
const {of} = Observable

import {TabbedPage} from 'components/ui'
import Overview from './Overview'
import Shifts from './Shifts'
import {Shifts as ShiftsRemote} from 'components/remote'

function getPathParts(pathname) {
  return pathname.split('/').filter(Boolean)
}

function hasShifts(pathname) {
  return getPathParts(pathname).indexOf('shifts') !== -1
}

function makeTabTitle(pathname) {
  const pathParts = getPathParts(pathname)
  const date = pathParts[pathParts.length - 1]
  return date
}

function makeTabs(dates) {
  return [
    {path: '/', label: 'Overview'},
    ...dates.map(d => ({path: '/shifts/' + d, label: d})),
  ]
}
/*
function compareDates(a, b) {
  const aParts = a.split('-').filter(Boolean)
  const bParts = b.split('-').filter(Boolean)
  for (let i = 0; i < aParts.length; ++i) {
    if (aParts[i] !== bParts[i]) {
      return false
    }
  }
  return true
}*/

function removeDuplicates(arr) {
  const newArray = []
  for (let i = 0; i < arr.length; ++i) {
    if (newArray.indexOf(arr[i]) === -1) {
      newArray.push(arr[i])
    }
  }
  return newArray
}

export default sources => {
  const teamShifts$ = sources.teamKey$
    .flatMapLatest(ShiftsRemote.query.byTeam(sources))
    .map(arr => arr.map(a => a.date))
    .map(removeDuplicates)
    .do(x => console.log(x, 'teamShifts'))

  const pathname$ = sources.router.observable.pluck('pathname')
    //.distinctUntilChanged()
    .filter(hasShifts)
    .map(makeTabTitle)
    .do(x => console.log(x, 'pathname'))
    .startWith('')
    .shareReplay(1)

    //.map(makeTabs)

  const tabs$ = pathname$
    .map(x => [x])
    .combineLatest(
      teamShifts$,
      (tabs, dates) => dates.length > 0 ? tabs.concat(dates).filter(Boolean) : tabs
    ).map(removeDuplicates)
    .do(x => console.log('combined dates', x))
    .map(makeTabs)
    .do(x => console.log(x, 'tabs'))
    .startWith([{path: '/', label: 'Overview'}])
    .shareReplay(1)


  const routes$ = of({
    '/': Overview,
    '/shifts/:date': date => _sources => Shifts({..._sources, date$: of(date)}),
  })

  return {
    pageTitle: of('Schedule'),
    ...TabbedPage({...sources, tabs$, routes$}),
  }
}
