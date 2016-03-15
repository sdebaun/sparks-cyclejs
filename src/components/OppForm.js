import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'
import {Input,Select} from 'snabbdom-material'
import {col} from 'helpers'
import isolate from '@cycle/isolate'

import makeInputControl from 'components/InputControlFactory'

const _render = ({
  opp: {name, projectKey},
  nameInputDOM,
}) =>
  col(
    nameInputDOM,
  )

const NameInput = makeInputControl({
  label: 'Name the Opportunity',
  className: 'name',
})

export default sources => {
  // why does isolate break this???
  // const inviteEmailInput = isolate(InviteEmailInput)(sources)
  const nameInput = NameInput(sources)

  const opp$ = combineLatestObj({
    name$: nameInput.value$,
  })

  const viewState = {
    opp$,
    nameInputDOM$: nameInput.DOM,
  }

  const DOM = combineLatestObj(viewState).map(_render)

  return {DOM, opp$}
}