import {Observable} from 'rx'
const {just} = Observable
import combineLatestObj from 'rx-combine-latest-obj'
import {div} from 'cycle-snabbdom'

import {Appbar} from 'snabbdom-material'

import {material} from 'util'

const AccentToolbar = sources => ({
  DOM: combineLatestObj({
    leftItemDOM$: sources.leftItemDOM$ || just(null),
    titleDOM$: sources.titleDOM$ || just('no title'),
    rightItemDOM$: sources.rightItemDOM$ || just(null),
  }).map(({
    leftItemDOM,
    titleDOM,
    rightItemDOM,
  }) =>
    // div({},[leftItemDOM,titleDOM,rightItemDOM])
    Appbar({material}, [
      leftItemDOM && div({style: {float: 'left'}}, [leftItemDOM]),
      Appbar.Title({style: {float: 'left'}}, [titleDOM]),
      rightItemDOM && div({style: {float: 'right'}}, [rightItemDOM]),
    ].filter(e => !!e))
  ),
})

const Toolbar = sources => ({
  DOM: combineLatestObj({
    leftItemDOM$: sources.leftItemDOM$ || just(null),
    titleDOM$: sources.titleDOM$ || just('no title'),
    rightItemDOM$: sources.rightItemDOM$ || just(null),
  }).map(({
    leftItemDOM,
    titleDOM,
    rightItemDOM,
  }) =>
    // div({},[leftItemDOM,titleDOM,rightItemDOM])
    Appbar({fixed: true, material}, [
      leftItemDOM && div({style: {float: 'left'}}, [leftItemDOM]),
      Appbar.Title({style: {float: 'left'}}, [titleDOM]),
      rightItemDOM && div({style: {float: 'right'}}, [rightItemDOM]),
    ].filter(e => !!e))
  ),
})

export {Toolbar, AccentToolbar}
