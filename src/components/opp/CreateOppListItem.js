// TODO: NEXT - test case for extracting modal dialog

import {Observable} from 'rx'
const {just} = Observable

import combineLatestObj from 'rx-combine-latest-obj'

// import isolate from '@cycle/isolate'

import {Opps} from 'remote'

import {OppForm} from 'components/opp'
import {Dialog, ListItemClickable} from 'components/sdm'

import {div} from 'helpers'

// import {log} from 'util'

const CreateOppDialog = sources => Dialog({...sources,
  titleDOM$: just('Create an Opportunity'),
})

const ListItemWithDialog = sources => {
  const listItem = ListItemClickable(sources)

  const dialog = CreateOppDialog({...sources,
    isOpen$: listItem.click$.map(true),
    contentDOM$: sources.dialogContentDOM$,
  })

  const DOM = combineLatestObj({
    listItemDOM$: listItem.DOM,
    dialogDOM$: dialog.DOM,
  }).map(({
    listItemDOM,
    dialogDOM,
  }) =>
    div({},[listItemDOM, dialogDOM])
  )

  return {
    DOM,
    submit$: dialog.submit$,
  }
}

const CreateOppListItem = sources => {
  const form = OppForm(sources)

  const listItem = ListItemWithDialog({...sources,
    iconName$: just('power'),
    title$: just('Create an Opportunity to get volunteers.'),
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
