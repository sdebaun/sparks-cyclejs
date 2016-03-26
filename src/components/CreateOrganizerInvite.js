import {Observable} from 'rx'
const {just} = Observable

// import isolate from '@cycle/isolate'

import {Organizers} from 'remote'

// import {OppForm} from 'components/opp'
import {ListItemWithDialog} from 'components/sdm'
import {OrganizerInviteForm} from 'components/OrganizerInviteForm'

const CreateOrganizerListItem = sources => {
  const form = OrganizerInviteForm(sources)

  const listItem = ListItemWithDialog({...sources,
    iconName$: just('person_add'),
    title$: just('Invite another Organizer to help you run the project.'),
    dialogTitleDOM$: just('Invite Organizer'),
    dialogContentDOM$: form.DOM,
  })

  const queue$ = form.item$
    .sample(listItem.submit$)
    .zip(sources.projectKey$, (opp,projectKey) => ({projectKey, ...opp}))
    .map(Organizers.create)

  return {
    DOM: listItem.DOM,
    queue$,
  }
}

export default CreateOrganizerListItem

///


// import {Observable} from 'rx'
// import combineLatestObj from 'rx-combine-latest-obj'

// // import isolate from '@cycle/isolate'

// import {Organizers} from 'remote'

// import {OrganizerInviteForm} from 'components/OrganizerInviteForm'

// import {col} from 'helpers'
// import modal from 'helpers/modal'
// import listItem from 'helpers/listItem'

// // import {log} from 'util'

// const _openActions$ = ({DOM}) => Observable.merge(
//   DOM.select('.open').events('click').map(true),
//   DOM.select('.close').events('click').map(false),
// )

// const _submitAction$ = ({DOM}) =>
//   DOM.select('.submit').events('click').map(true)

// const _render = ({isOpen, organizerInviteFormDOM}) =>
//   col(
//     listItem({
//       iconName: 'person_add',
//       iconBackgroundColor: 'yellow',
//       title: 'Invite Organizer',
//       className: 'open',
//       clickable: true,
//     }),
//     modal({
//       isOpen,
//       title: 'Invite Organizer',
//       iconName: 'person_add',
//       submitLabel: 'Bring Em On',
//       closeLabel: 'Not Yet',
//       content: organizerInviteFormDOM,
//     })
//   )

// export default sources => {
//   const organizerInviteForm = OrganizerInviteForm(sources)

//   const submit$ = _submitAction$(sources)

//   const queue$ = organizerInviteForm.item$
//     .sample(submit$)
//     .zip(sources.projectKey$,
//       (organizer,projectKey) => ({projectKey, ...organizer})
//     )
//     .map(Organizers.create)

//   const isOpen$ = _openActions$(sources)
//     .merge(submit$.map(false))
//     .startWith(false)

//   const viewState = {
//     isOpen$,
//     project$: sources.project$,
//     organizerInviteFormDOM$: organizerInviteForm.DOM,
//   }

//   const DOM = combineLatestObj(viewState).map(_render)

//   return {DOM, queue$}
// }
