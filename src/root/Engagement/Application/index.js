import {Observable} from 'rx'
// import combineLatestObj from 'rx-combine-latest-obj'
import isolate from '@cycle/isolate'

// import {div, span} from 'cycle-snabbdom'

// import AppFrame from 'components/AppFrame'
// import Title from 'components/Title'
// import Header from 'components/Header'
import TabBar from 'components/TabBar'
// import ComingSoon from 'components/ComingSoon'
// import ProjectNav from 'components/ProjectNav'

import {nestedComponent, mergeOrFlatMapLatest} from 'util'

import AnswerQuestion from './AnswerQuestion'
import ChooseTeams from './ChooseTeams'
import NextSteps from './NextSteps'

const _routes = {
  '/': isolate(NextSteps),
  '/question': isolate(AnswerQuestion),
  '/teams': isolate(ChooseTeams),
}

const _tabs = [
  {path: '/', label: 'Next Steps'},
  {path: '/question', label: 'Answer Question'},
  {path: '/teams', label: 'Choose Teams'},
]

export default sources => {
  const page$ = nestedComponent(
    sources.router.define(_routes), sources,
  )

  const tabBar = TabBar({...sources, tabs: Observable.just(_tabs)})

  const children = [page$, tabBar]

  const DOM = page$.flatMapLatest(page => page.DOM)

  const tabBarDOM = tabBar.DOM

  const pageTitle = Observable.just('Your Application')

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
