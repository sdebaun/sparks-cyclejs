import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import {col, div} from 'helpers'
import listItem from 'helpers/listItem'

const _openActions$ = ({DOM}) => Observable.merge(
  DOM.select('.clickable').events('click').scan((a) => !a, false),
)

const toHelp = () =>
  listItem({
    iconName: 'users',
    title: 'To help with __________',
  })

const ticketTo = () =>
  listItem({
    iconName: 'ticket',
    title: 'A ticket to __________',
  })

const benefits = () =>
  listItem({
    iconName: 'insert_invitation',
    title: 'The awesome benefits of ......',
  })

const extras = () =>
  listItem({
    iconName: 'build',
    title: 'All these awesome extras: _________',
  })

const _render = ({isOpen}) =>
  col(
    listItem({
      iconName: 'trophy',
      title: 'What do you your volunteers get?',
      iconBackgroundColor: 'yellow',
      clickable: true,
    }),
    isOpen && div({style: {paddingLeft: '1em', paddingRight: '1em'}}, [
      toHelp(),
      ticketTo(),
      benefits(),
      extras(),
    ])
  )

export default sources => {
  const isOpen$ = _openActions$(sources).startWith(false)

  const viewState = {
    isOpen$,
  }

  const DOM = combineLatestObj(viewState).map(_render)
  return {DOM, isOpen$}
}
