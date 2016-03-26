import {Observable} from 'rx'
const {just} = Observable

// import isolate from '@cycle/isolate'

import {Teams} from 'remote'

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
    .zip(sources.projectKey$, (item,projectKey) => ({projectKey, ...item}))
    .map(Teams.create)

  return {
    DOM: listItem.DOM,
    queue$,
  }
}

export {CreateTeamListItem}


// // TODO: TLC

// import {Observable} from 'rx'
// import combineLatestObj from 'rx-combine-latest-obj'

// // import isolate from '@cycle/isolate'

// import {Teams} from 'remote'

// import {TeamForm} from './TeamForm'

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

// const _render = ({isOpen, teamFormDOM}) =>
//   col(
//     listItem({
//       iconName: 'group_add',
//       iconBackgroundColor: 'yellow',
//       title: 'Build your first Team',
//       className: 'open',
//       clickable: true,
//     }),
//     modal({
//       isOpen,
//       title: 'Build your first Team',
//       iconName: 'group_add',
//       submitLabel: 'Make It So',
//       closeLabel: 'Hang On',
//       content: teamFormDOM,
//     })
//   )

// const CreateTeam = sources => {
//   const teamForm = TeamForm(sources)

//   const submit$ = _submitAction$(sources)

//   const queue$ = teamForm.item$
//     .sample(submit$)
//     .zip(sources.projectKey$,
//       (team,projectKey) => ({projectKey, ...team})
//     )
//     .map(Teams.create)

//   const isOpen$ = _openActions$(sources)
//     .merge(submit$.map(false))
//     .startWith(false)

//   const viewState = {
//     isOpen$,
//     project$: sources.project$,
//     teamFormDOM$: teamForm.DOM,
//   }

//   const DOM = combineLatestObj(viewState).map(_render)

//   return {DOM, queue$}
// }

// export {CreateTeam}
