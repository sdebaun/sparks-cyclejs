// TODO: NEXT - test case for extracting modal dialog

import {Observable} from 'rx'
const {just, empty} = Observable

import combineLatestObj from 'rx-combine-latest-obj'

// import isolate from '@cycle/isolate'

import {Opps} from 'remote'

import {OppForm} from 'components/opp'
import {Dialog, ListItemClickable} from 'components/sdm'

import {div, col} from 'helpers'
// import listItem from 'helpers/listItem'

// import {log} from 'util'

const _render = ({modalDOM}) =>
  col(
    // listItem({
    //   iconName: 'power',
    //   iconBackgroundColor: 'yellow',
    //   title: 'Create an Opportunity to get volunteers.',
    //   className: 'open',
    //   clickable: true,
    // }),
    modalDOM,
  )

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

// const CreateOppListItem = sources => {
const CreateOpp = sources => {
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

// const CreateOppListItem = sources => ListItemWithDialog({
//   iconName$: just('power'),
//   title$: just('Create an Opportunity to get volunteers.'),
//   DialogControl$: just(CreateOppDialog),
// })

const xxCreateOpp = sources => {
  const listItem = ListItemClickable({...sources,
    iconName$: just('power'),
    title$: just('Create an Opportunity to get volunteers.'),
  })

  const form = OppForm(sources)

  const dialog = CreateOppDialog({...sources,
    isOpen$: listItem.click$.map(true),
    contentDOM$: form.DOM,
  })

  const queue$ = form.item$
    .sample(dialog.submit$)
    .zip(sources.projectKey$, (opp,projectKey) => ({projectKey, ...opp}))
    .map(Opps.create)

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
    queue$,
  }
}

const xCreateOpp = sources => {
  const isOpen$ = sources.DOM.select('.open').events('click')
    .map(true)
    .startWith(false)

  const oppForm = OppForm(sources)

  const oppDialog = CreateOppDialog({...sources,
    isOpen$,
    contentDOM$: oppForm.DOM,
  })

  const queue$ = oppForm.item$
    .sample(oppDialog.submit$)
    .zip(sources.projectKey$, (opp,projectKey) => ({projectKey, ...opp}))
    .map(Opps.create)

  const viewState = {
    isOpen$,
    project$: sources.project$,
    modalDOM$: oppDialog.DOM,
  }

  const DOM = combineLatestObj(viewState).map(_render)

  return {
    DOM,
    queue$,
  }
}

export {CreateOpp}
