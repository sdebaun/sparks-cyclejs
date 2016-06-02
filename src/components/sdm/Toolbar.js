import {Observable} from 'rx'
const {just} = Observable
import combineLatestObj from 'rx-combine-latest-obj'
import {div} from 'cycle-snabbdom'

import {Appbar} from 'snabbdom-material'

import {material} from 'util'

const LEFTSTYLE = {style: {display: 'block', width: '32px', float: 'none'}}
const MIDSTYLE = {style: {display: 'block', flex: '100% 100%', float: 'none'}}
const RIGHTSTYLE = {style: {flex: '25% 25%'}}

const AccentToolbar = sources => ({
  DOM: combineLatestObj({
    leftItemDOM$: sources.leftItemDOM$ || just(null),
    titleDOM$: sources.titleDOM$ || sources.title$ || just('no title'),
    rightItemDOM$: sources.rightItemDOM$ || just(null),
  }).map(({
    leftItemDOM,
    titleDOM,
    rightItemDOM,
  }) =>
    Appbar({material}, [div({style: {display: 'flex'}}, [
      leftItemDOM && div(LEFTSTYLE, [leftItemDOM]),
      Appbar.Title(MIDSTYLE, [titleDOM]),
      rightItemDOM && div(RIGHTSTYLE, [rightItemDOM]),
    ].filter(e => !!e))])
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
    Appbar({fixed: true, material}, [
      leftItemDOM && div({style: {float: 'left'}}, [leftItemDOM]),
      Appbar.Title({style: {float: 'left'}}, [titleDOM]),
      rightItemDOM && div({style: {float: 'right'}}, [rightItemDOM]),
    ].filter(e => !!e))
  ),
})

export {Toolbar, AccentToolbar}
