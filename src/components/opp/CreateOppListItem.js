import {Observable} from 'rx'
const {just} = Observable

// import isolate from '@cycle/isolate'

import {Opps} from 'remote'

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
    .map(Opps.create)

  return {
    DOM: listItem.DOM,
    queue$,
  }
}

export {CreateOppListItem}
