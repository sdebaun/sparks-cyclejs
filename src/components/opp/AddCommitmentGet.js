import {Observable} from 'rx'
const {empty, just} = Observable
import combineLatestObj from 'rx-combine-latest-obj'

import {col, div} from 'helpers'
import listItem from 'helpers/listItem'
import menuItem from 'helpers/menuItem'
import {DropdownMenu} from 'components/DropdownMenu'

const _openActions$ = ({DOM}) => Observable.merge(
  DOM.select('.clickable').events('click').map(() => true),
)

const toHelp = () =>
  menuItem({
    iconName: 'users',
    title: 'To help with __________',
  })

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

import {makeModal} from 'components/ui'

const GetHelpModal = makeModal({
  title: 'a title',
  icon: 'power',
})

const GetHelpForm = sources => {
  const DOM = just(div({},['a form']))
  return {
    DOM,
  }
}

const GetHelp = sources => {
  const isOpen$ = sources.DOM.select('.get-help').events('click')
    .map(true)
    .startWith(false)
  const f = GetHelpForm(sources)
  const m = GetHelpModal({contentDOM$: f.DOM, isOpen$, ...sources})

  const DOM = just(
    menuItem({
      iconName: 'users',
      title: 'To help a community',
      className: 'get-help',
    }),
  )

  return {
    DOM,
    modalDOM: m.DOM,
  }
}

export const AddCommitmentGet = sources => {
  const isOpen$ = _openActions$(sources).startWith(false)

  const getHelp = GetHelp(sources)

  const children$ = just([div({},[
    getHelp.DOM,
    // getHelp.modalDOM,
    ticketTo(),
    benefits(),
    extras(),
  ])])

  const dropdown = DropdownMenu({...sources, isOpen$, children$})

  const viewState = {
    dropdownDOM$: dropdown.DOM,
    getHelpModalDOM$: getHelp.modalDOM,
  }

  const DOM = combineLatestObj(viewState).map(_render)

  return {
    DOM,
    isOpen$,
    queue$: empty(),
  }
}
