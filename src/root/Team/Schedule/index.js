import {Observable} from 'rx'
const {of, combineLatest} = Observable

import {TabbedPage} from 'components/ui'
import Overview from './Overview'
import Shifts from './Shifts'
import {Shifts as ShiftsRemote} from 'components/remote'

import {log} from 'util'

import {localTime} from 'util'

const fromPath = pathName => {
  const items = pathName.split('/').filter(Boolean)
  return items[4]
}

const _Fetch = sources => {
  const shifts$ = sources.teamKey$
    .flatMapLatest(ShiftsRemote.query.byTeam(sources))
    // .tap(log('shifts$'))

  const shiftDates$ = shifts$
    .map(arr => arr.map(a => localTime(a.date).format('YYYY-MM-DD')))
    // .tap(log('shiftDates$'))

  // Y U NO
  // const selectedDate$ = (sources.date$ || of(null))
  //   .tap(log('date$'))

  const selectedDate$ = sources.router.observable.pluck('pathname')
    .map(fromPath)

  const allDates$ = combineLatest(shiftDates$, selectedDate$)
    .tap(log('allDates$ start'))
    .map(([fmShifts,fmSelected]) => [...fmShifts, fmSelected].filter(i => !!i))
    .map(arr => arr.sort())
    // .map(arr => arr.filter((item, pos, ary) => !pos || item !== ary[pos - 1]))
    .map(arr => Array.from(new Set(arr))) // orly???
    // .tap(log('allDates$ end'))
    .shareReplay(1)

  return {
    shifts$,
    selectedDate$,
    allDates$,
  }
}

const TabBuilder = sources => {
  const overview$ = of({path: '/', label: 'Overview'})
  const dateTabs$ = sources.allDates$
    .map(arr => arr.map(d => ({path: '/shifts/' + d, label: d})))
    .tap(log('dateTabs$'))

  const tabs$ = combineLatest(overview$, dateTabs$)
    .map(([ov,dt]) => [ov, ...dt])
    .shareReplay(1)
    .tap(log('tabs$'))

  return {tabs$}
}

export default sources => {
  const _sources = {...sources, ..._Fetch(sources)}
  const {tabs$} = TabBuilder(_sources)

  const routes$ = of({
    '/': Overview,
    '/shifts/:date': date => srcs => Shifts({...srcs, date$: of(date)}),
  })

  return {
    pageTitle: of('Schedule'),
    ...TabbedPage({..._sources, tabs$, routes$}),
  }
}
