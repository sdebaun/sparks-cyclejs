import {Observable} from 'rx'
const {just} = Observable
import {objOf} from 'ramda'

import {Opps} from 'components/remote'

import {OppForm} from 'components/opp'
import {ListItemWithDialog} from 'components/sdm'

const CreateOppListItem = sources => {
  const form = OppForm(sources)

  const listItem = ListItemWithDialog({...sources,
    iconName$: just('power'),
    title$: just('Create an Opportunity to get volunteers.'),
    dialogTitleDOM$: just('Create an Opportunity'),
    dialogContentDOM$: form.DOM,
  })

  const queue$ = form.item$
    .sample(listItem.submit$)
    .zip(sources.projectKey$, (opp,projectKey) => ({projectKey, ...opp}))
    .map(objOf('values'))
    .map(Opps.action.create)

  return {
    DOM: listItem.DOM,
    queue$,
  }
}

export {CreateOppListItem}
