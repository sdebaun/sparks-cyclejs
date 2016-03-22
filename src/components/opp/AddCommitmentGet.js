import {Observable} from 'rx'
const {just, merge} = Observable
import combineLatestObj from 'rx-combine-latest-obj'

// import isolate from '@cycle/isolate'

import {col, div} from 'helpers'
import listItem from 'helpers/listItem'
import menuItem from 'helpers/menuItem'
import {DropdownMenu} from 'components/DropdownMenu'

import makeInputControl from 'components/InputControlFactory'
import {makeMenuItemPopup} from 'components/ui'

// import {log} from 'util'

const _openActions$ = ({DOM}) => Observable.merge(
  DOM.select('.clickable').events('click').map(() => true),
)

// const toHelp = () =>
//   menuItem({
//     iconName: 'users',
//     title: 'To help with __________',
//   })

const ticketTo = () =>
  menuItem({
    iconName: 'ticket',
    title: 'A ticket to __________',
  })

const benefits = () =>
  menuItem({
    iconName: 'insert_invitation',
    title: 'The awesome benefits of ......',
  })

const extras = () =>
  menuItem({
    iconName: 'build',
    title: 'All these awesome extras: _________',
  })

const _render = ({dropdownDOM, getHelpModalDOM}) =>
  col(
    listItem({
      iconName: 'plus',
      title: 'What do Volunteers GET?',
      iconBackgroundColor: 'yellow',
      clickable: true,
    }),
    dropdownDOM,
    getHelpModalDOM,
  )

const WhoInput = makeInputControl({
  label: 'Who is being helped?',
  className: 'help',
})

const GetHelpForm = sources => {
  const whoInput = WhoInput(sources)

  const commitment$ = combineLatestObj({
    who$: whoInput.value$,
  })

  const viewState = {
    whoInputDOM: whoInput.DOM,
  }

  const DOM = combineLatestObj(viewState).map(({whoInputDOM}) =>
    col(whoInputDOM)
  )

  return {
    DOM,
    commitment$,
  }
}

const GetHelpItemPopup = makeMenuItemPopup({
  iconName: 'users',
  title: 'To help a community',
  className: 'get-help',
})

const GetHelp = sources => {
  const f = GetHelpForm(sources)
  const control = GetHelpItemPopup({contentDOM$: f.DOM, ...sources})

  const commitment$ = f.commitment$
    .sample(control.submit$)
    .map(c => ({code: 'help', ...c}))

  return {
    itemDOM: control.itemDOM,
    modalDOM: control.modalDOM,
    submit$: control.submit$,
    commitment$,
  }
}

export const AddCommitmentGet = sources => {
  const getHelp = GetHelp(sources)

  const children$ = just([div({},[
    getHelp.itemDOM,
    ticketTo(),
    benefits(),
    extras(),
  ])])

  const isOpen$ = _openActions$(sources).startWith(false)
    .merge(getHelp.submit$.map(false))

  const dropdown = DropdownMenu({...sources, isOpen$, children$})

  const viewState = {
    dropdownDOM$: dropdown.DOM,
    getHelpModalDOM$: getHelp.modalDOM,
  }

  const DOM = combineLatestObj(viewState).map(_render)

  const commitment$ = merge(
    getHelp.commitment$,
  ).map(c => ({party: 'org', ...c}))

  return {
    DOM,
    isOpen$,
    commitment$,
  }
}
