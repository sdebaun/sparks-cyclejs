import {Observable} from 'rx'
// import combineLatestObj from 'rx-combine-latest-obj'
// import isolate from '@cycle/isolate'

// import {div, span} from 'cycle-snabbdom'

// import AppFrame from 'components/AppFrame'
// import Title from 'components/Title'
// import Header from 'components/Header'
import TabBar from 'components/TabBar'
import ComingSoon from 'components/ComingSoon'
// import ProjectNav from 'components/ProjectNav'

import {nestedComponent, mergeOrFlatMapLatest} from 'util'
// import {icon} from 'helpers'

// import {rows, log} from 'util'

import Describe from './Describe'
import Applying from './Applying'

// const Describe = ComingSoon('Opp/Glance/Describe')
const Exchange = ComingSoon('Opp/Glance/Exchange')
// const Applying = ComingSoon('Opp/Glance/Applying')

const _routes = {
  '/': Describe,
  '/exchange': Exchange,
  '/applying': Applying,
}

const _tabs = [
  {path: '/', label: 'Describe'},
  {path: '/exchange', label: 'Exchange'},
  {path: '/applying', label: 'Applying'},
]

export default sources => {
  const page$ = nestedComponent(
    sources.router.define(_routes), sources,
  )

  const tabBar = TabBar({...sources, tabs: Observable.just(_tabs)})

  const children = [page$, tabBar]

  const DOM = page$.flatMapLatest(page => page.DOM)

  const tabBarDOM = tabBar.DOM

  const pageTitle = Observable.just('Manage')

  const auth$ = mergeOrFlatMapLatest('auth$', ...children)

  const queue$ = mergeOrFlatMapLatest('queue$', ...children)

  const route$ = mergeOrFlatMapLatest('route$', ...children)

  return {
    DOM,
    tabBarDOM,
    pageTitle,
    auth$,
    queue$,
    route$,
  }
}
