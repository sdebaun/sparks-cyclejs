import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'
import {Input,Select} from 'snabbdom-material'
import {col} from 'helpers'
import makeSelectControl from 'components/SelectControlFactory'
import isolate from '@cycle/isolate'

const authorityOptions = [
  {value: 'manager', label: 'Manager'},
  {value: 'owner', label: 'Owner'},
]

const _render = ({organizer: {inviteEmail, projectKey}, authoritySelectDOM}) =>
  col(
    Input({
      className: 'inviteEmail',
      label: 'Send Invite to Email',
      value: inviteEmail,
    }),
    authoritySelectDOM,
  )

const AuthoritySelect = makeSelectControl({
  label: 'What kind of Organizer?',
  options: authorityOptions,
  className: 'authority',
})

export default sources => {
  const authoritySelect = isolate(AuthoritySelect)(sources)

  const submitted$ = combineLatestObj({
    authority$: authoritySelect.value$,
  })

  const organizer$ = Observable.just({})
    .merge(submitted$)

  const viewState = {
    organizer$,
    authoritySelectDOM$: authoritySelect.DOM,
  }

  const DOM = combineLatestObj(viewState).map(_render)

  return {DOM, organizer$}
}
