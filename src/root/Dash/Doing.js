import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import {div} from 'cycle-snabbdom'

const _DOM = ({userProfile}) =>
  div({}, JSON.stringify(userProfile))

export default sources => {
  const DOM = combineLatestObj({
    userProfile$: sources.userProfile$,
  }).map(_DOM)

  return {
    DOM,
  }
}
