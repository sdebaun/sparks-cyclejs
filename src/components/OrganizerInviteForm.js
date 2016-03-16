// import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'
import {col} from 'helpers'
import isolate from '@cycle/isolate'

import makeSelectControl from 'components/SelectControlFactory'
import makeInputControl from 'components/InputControlFactory'

const authorityOptions = [
  {value: 'manager', label: 'Manager'},
  {value: 'owner', label: 'Owner'},
]

const _render = ({
  authoritySelectDOM, inviteEmailInputDOM,
}) =>
  col(
    inviteEmailInputDOM,
    authoritySelectDOM,
  )

const InviteEmailInput = makeInputControl({
  label: 'Send Invite to Email',
  className: 'inviteEmail',
})

const AuthoritySelect = makeSelectControl({
  label: 'What kind of Organizer?',
  options: authorityOptions,
  className: 'authority',
})

export default sources => {
  const authoritySelect = isolate(AuthoritySelect)(sources)
  // why does isolate break this???
  // const inviteEmailInput = isolate(InviteEmailInput)(sources)
  const inviteEmailInput = InviteEmailInput(sources)

  const organizer$ = combineLatestObj({
    authority$: authoritySelect.value$,
    inviteEmail$: inviteEmailInput.value$,
  })

  const viewState = {
    organizer$,
    authoritySelectDOM$: authoritySelect.DOM,
    inviteEmailInputDOM$: inviteEmailInput.DOM,
  }

  const DOM = combineLatestObj(viewState).map(_render)

  return {DOM, organizer$}
}
