import {Observable} from 'rx'
import {ReplaySubject} from 'rx'
const {just, combineLatest, empty} = Observable
import {curryN, objOf} from 'ramda'

import {div} from 'helpers'

import isolate from '@cycle/isolate'

export const PROVIDERS = {
  google: {type: 'popup', provider: 'google'},
  facebook: {type: 'popup', provider: 'facebook'},
  logout: {type: 'logout'},
}

import moment from 'moment'

export const hideable = Control => sources => {
  const ctrl = Control(sources)
  const {DOM, ...sinks} = ctrl
  return {
    DOM: sources.isVisible$.flatMapLatest(v => v ? DOM : just(div({}, [null]))),
    ...sinks,
  }
}

export const startValue = (Control, value) => sources => {
  const value$ = new ReplaySubject(1)
  value$.onNext(value)

  const ctrl = Control({...sources,
    value$,
  })

  ctrl.value$.subscribe(v => value$.onNext(v))

  return {
    ...ctrl,
    value$,
  }
}

export const localTime = t => //1p
  moment(t).utc().add(moment.parseZone(t).utcOffset(),'m')

export const formatTime = t =>
  localTime(t).format('hh:mm a')

export const requireSources = (cname, sources, ...sourceNames) =>
  sourceNames.forEach(n => {
    if (!sources[n]) { throw new Error(cname + ' must specify ' + n)}
  })

export const trimTo = (val, len) =>
  val.length > len ? val.slice(0,len) + '...' : val

export const combineLatestToDiv = (...domstreams) =>
  combineLatest(...domstreams, (...doms) => div({},doms))

export const combineDOMsToDiv = (d, ...comps) =>
  combineLatest(...comps.map(c => c.DOM), (...doms) => div(d, doms))

export const controlsFromRows = curryN(3)((sources, rows, Control) => {
  if (rows.length === 0) {
    return sources.emptyDOM$ ? [sources.emptyDOM$.map(objOf('DOM'))] : []
  } else {
    return rows.map((row, i) =>
      isolate(Control,row.$key)({
        ...sources,
        item$: just(row),
        index$: just(i),
      }))
  }
})

export const byMatch = (matchDomain,matchEvent) =>
  ({domain,event}) => domain === matchDomain && event === matchEvent

export const rows = obj =>
  obj ? Object.keys(obj).map(k => ({$key: k, ...obj[k]})) : []

export const log = label => emitted => console.log(label,':',emitted)

export const isObservable = obs => typeof obs.subscribe === 'function'

function pluckFlat(component, key) {
  return component.flatMapLatest(obj => obj[key] || Observable.never())
}

export function nestedComponent(match$, sources) {
  const component = match$.map(({path, value}) => {
    // console.log('nestedComponent path$',path)
    return value({...sources, router: sources.router.path(path)})
  }).shareReplay(1)

  component.pluckFlat = (key) => pluckFlat(component, key)

  return component
}

export const mergeOrFlatMapLatest = (prop, ...sourceArray) =>
  Observable.merge(
    sourceArray.map(src => // array.map!
      isObservable(src) ? // flatmap if observable
        src.flatMapLatest(l => l[prop] || Observable.empty()) :
        // otherwise look for a prop
        src[prop] || Observable.empty()
    )
  )

export const mergeSinks = (...childs) => ({
  auth$: mergeOrFlatMapLatest('auth$', ...childs),
  queue$: mergeOrFlatMapLatest('queue$', ...childs),
  route$: mergeOrFlatMapLatest('route$', ...childs),
  focus$: mergeOrFlatMapLatest('focus$', ...childs),
  openAndPrint: mergeOrFlatMapLatest('openAndPrint', ...childs),
})

export const pluckLatest = (k,s$) => s$.pluck(k).switch()

export const pluckLatestOrNever = (k,s$) =>
  s$.map(c => c[k] || empty()).switch()

// app-wide material styles
export const material = {
  primaryColor: '#666',
  primaryFontColor: 'rgba(255, 255, 255, 0.9)',
  primaryFontColorDisabled: 'rgba(0, 0, 0, 0.45)',
  primaryLightWaves: false,
  secondaryColor: '#009688',
  secondaryFontColor: 'rgba(255, 255, 255, 0.9)',
  secondaryFontColorDisabled: 'rgba(255, 255, 255, 0.6)',
  secondaryLightWaves: true,
  errorColor: '#C00',
  successColor: '#090',
  typographyColor: '#212121',

  sidenav: {
    width: '280px',
    left: '-290px',
    transition: 'left .3s ease-out',
    delayed: {
      left: '0',
    },
    remove: {
      left: '-290px',
    },
  },

  fadeInOut: {
    opacity: '0',
    transition: 'opacity .3s',
    delayed: {
      opacity: '1',
    },
    remove: {
      opacity: '0',
    },
  },
}
