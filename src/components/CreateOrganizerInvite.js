import {Observable} from 'rx'
const {just} = Observable

// import isolate from '@cycle/isolate'

import {Organizers} from 'components/remote'

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

  const queue$ = form.item$.shareReplay(1)
    .sample(listItem.submit$)
    .withLatestFrom(sources.projectKey$,
      (values, projectKey) => ({values: {...values, projectKey}})
    )
    .map(Organizers.action.create)
    .tap(x => console.log('', x))

  return {
    DOM: listItem.DOM,
    queue$,
  }
}

export default CreateOrganizerListItem
