import {Observable} from 'rx'
const {just, combineLatest, merge} = Observable

import {div} from 'cycle-snabbdom'
import {FlatButton} from 'components/sdm'

const view = (...children) =>
  div({style: {textAlign: 'center'}}, children)

export const EngagementButtons = (sources) => {
  const priority = FlatButton({
    ...sources,
    label$: just('Priority'),
    classNames$: just(['green']),
  })
  const accept = FlatButton({
    ...sources,
    label$: just('Accept'),
    classNames$: just(['blue']),
  })
  const decline = FlatButton({
    ...sources,
    label$: just('Decline'),
    classNames$: just(['red']),
  })
  const close = FlatButton({
    ...sources,
    label$: just('Cancel'),
    classNames$: just(['accent']),
  })

  const DOM = combineLatest(
    priority.DOM, accept.DOM, decline.DOM, close.DOM,
    view
  )

  const value$ = merge(
    priority.click$.map(() => 'priority'),
    accept.click$.map(() => 'accept'),
    decline.click$.map(() => 'decline')
  ).shareReplay(1)

  return {
    DOM,
    value$,
    ok$: value$,
    cancel$: close.click$.share(),
  }
}
