import {Observable} from 'rx'
const {just} = Observable

import {Teams} from 'components/remote'

import {TeamForm} from 'components/team'
import {ListItemWithDialog} from 'components/sdm'

const CreateTeamListItem = sources => {
  const form = TeamForm(sources)

  const listItem = ListItemWithDialog({...sources,
    iconName$: just('group_add'),
    title$: just('Build your first Team.'),
    dialogTitleDOM$: just('Create a Team'),
    dialogContentDOM$: form.DOM,
  })

  const queue$ = form.item$
    .sample(listItem.submit$)
    .zip(sources.projectKey$, (item,projectKey) => ({projectKey, values: item}))
    .map(Teams.action.create)

  return {
    DOM: listItem.DOM,
    queue$,
  }
}

export {CreateTeamListItem}
