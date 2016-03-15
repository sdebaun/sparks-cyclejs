import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'
import isolate from '@cycle/isolate'

import {div, span} from 'cycle-snabbdom'

import AppFrame from 'components/AppFrame'
import Title from 'components/Title'
import Header from 'components/Header'
import TabBar from 'components/TabBar'
import ComingSoon from 'components/ComingSoon'
import ProjectNav from 'components/ProjectNav'

import {nestedComponent, mergeOrFlatMapLatest} from 'util'
import {icon} from 'helpers'

import {rows, log} from 'util'

import Describe from './Describe'
import Staff from './Staff'

// const Describe = ComingSoon('Manage/Details')
// const Staff = ComingSoon('Manage/Details')
const Connect = ComingSoon('Manage/Connect')

const _routes = {
  '/': isolate(Describe),
  '/staff': isolate(Staff),
  '/connect': isolate(Connect),
}

const _tabs = [
  {path: '/', label: 'Describe'},
  {path: '/staff', label: 'Staff'},
  {path: '/connect', label: 'Connect'},
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

  route$.subscribe(log('route$'))

  return {
    DOM,
    tabBarDOM,
    pageTitle,
    auth$,
    queue$,
    route$,
  }
}
