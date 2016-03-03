import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import {div} from 'cycle-snabbdom'

const _DOM = ({project}) =>
  div({}, JSON.stringify(project))

export default sources => {
  const DOM = combineLatestObj({
    project$: sources.project$,
  }).map(_DOM)

  return {
    DOM,
  }
}
