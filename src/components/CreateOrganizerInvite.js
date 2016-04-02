import {Observable} from 'rx'
const {just} = Observable

// import isolate from '@cycle/isolate'

import {Organizers} from 'remote'

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
