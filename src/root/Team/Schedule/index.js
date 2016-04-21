import {Observable} from 'rx'
const {of, combineLatest} = Observable

import {TabbedPage} from 'components/ui'
import Overview from './Overview'
import Shifts from './Shifts'
import {Shifts as ShiftsRemote} from 'components/remote'

import moment from 'moment'

function getPathParts(pathname) {
  return pathname.split('/').filter(Boolean)
}

function hasShifts(pathname) {
  return getPathParts(pathname).indexOf('shifts') !== -1
}

function dateFromPath(pathname) {
  if (!hasShifts(pathname)) { return null }
  const pathParts = getPathParts(pathname)
  const date = pathParts[pathParts.length - 1]
  return date
}

function makeTabs(dates) {
  return dates.map(d => ({path: '/shifts/' + d, label: d}))
}

function removeDuplicates(arr) {
  const newArray = []
  for (let i = 0; i < arr.length; ++i) {
    if (newArray.indexOf(arr[i]) === -1) {
      newArray.push(arr[i])
    }
  }
  return newArray
}

import {localTime} from 'util'

export default sources => {
  const shifts$ = sources.teamKey$
    .flatMapLatest(ShiftsRemote.query.byTeam(sources))

  const shiftDates$ = shifts$
    .map(arr => arr.map(a => localTime(a.date).format('YYYY-MM-DD')))

  const selectedDate$ = sources.router.observable.pluck('pathname')
    .map(dateFromPath)

  const datesInTabs$ = combineLatest(
    shiftDates$, selectedDate$,
    (shiftDates, selectedDate) => selectedDate ?
      [selectedDate, ...shiftDates] :
      shiftDates
    )
    .map(removeDuplicates)
    .map(arr => arr.sort())

  const dateTabs$ = datesInTabs$
    .map(makeTabs)

  const tabs$ = combineLatest(
    of({path: '/', label: 'Overview'}),
    dateTabs$,
    (ov,dt) => [ov, ...dt]
  ).shareReplay(1)

  const routes$ = of({
    '/': Overview,
    '/shifts/:date': date => _sources => Shifts({..._sources, date$: of(date)}),
  })

  return {
    pageTitle: of('Schedule'),
    ...TabbedPage({...sources, tabs$, routes$}),
  }
}
