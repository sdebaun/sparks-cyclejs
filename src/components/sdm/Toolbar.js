import {Observable} from 'rx'
const {just} = Observable
import combineLatestObj from 'rx-combine-latest-obj'
import {div} from 'cycle-snabbdom'

import {Appbar} from 'snabbdom-material'

import {material} from 'util'

const Toolbar = sources => ({
  DOM: combineLatestObj({
    // leftItemDOM: sources.leftItemDOM,
    titleDOM: sources.titleDOM,
    rightItemDOM: sources.rightItemDOM,
  }).map(({
    // leftItemDOM,
    titleDOM,
    rightItemDOM,
  }) =>
    // div({},[leftItemDOM,titleDOM,rightItemDOM])
    Appbar({fixed: true, material}, [
      Appbar.Title({style: {float: 'left'}}, [titleDOM]),
      div({style: {float: 'right'}}, [rightItemDOM]),
    ])
  ),
})

export {Toolbar}
