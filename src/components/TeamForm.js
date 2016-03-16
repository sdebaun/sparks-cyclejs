// import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'
import {col} from 'helpers'
// import isolate from '@cycle/isolate'

import makeInputControl from 'components/InputControlFactory'

const _render = ({
  nameInputDOM,
}) =>
  col(
    nameInputDOM,
  )

const NameInput = makeInputControl({
  label: 'Name the new Team',
  className: 'name',
})

export default sources => {
  // why does isolate break this???
  // const inviteEmailInput = isolate(InviteEmailInput)(sources)
  const nameInput = NameInput(sources)

  const team$ = combineLatestObj({
    name$: nameInput.value$,
  })

  const viewState = {
    team$,
    nameInputDOM$: nameInput.DOM,
  }

  const DOM = combineLatestObj(viewState).map(_render)

  return {DOM, team$}
}
