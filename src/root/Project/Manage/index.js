import {Observable} from 'rx'
import isolate from '@cycle/isolate'

import TabBar from 'components/TabBar'
import ComingSoon from 'components/ComingSoon'

import {nestedComponent, mergeOrFlatMapLatest} from 'util'

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

  return {
    DOM,
    tabBarDOM,
    pageTitle,
    auth$,
    queue$,
    route$,
  }
}
