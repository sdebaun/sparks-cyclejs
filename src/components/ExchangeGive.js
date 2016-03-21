import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import {col, div} from 'helpers'
import listItem from 'helpers/listItem'

const _openActions$ = ({DOM}) => Observable.merge(
  DOM.select('.clickable').events('click').scan((a) => !a, false)
)

const waiver =
  listItem({
    iconName: 'calendar-check-o',
    title: 'Sign a liability waiver',
    iconBackgroundColor: 'red',
  })

const shifts =
  listItem({
    iconName: 'calendar2',
    title: 'One or more shifts of work',
  })

const payment =
  listItem({
    iconName: 'banknote',
    title: 'A payment',
  })

const deposit =
  listItem({
    iconName: 'ticket',
    title: 'A refundable deposit',
  })

const _render = ({isOpen}) =>
  col(
    listItem({
      iconName: 'plus',
      title: 'What do you your volunteers give?',
      iconBackgroundColor: 'yellow',
      clickable: true,
    }),
    isOpen && div({style: {paddingLeft: '1em', paddinRight: '1em'}}, [
      waiver,
      shifts,
      payment,
      deposit,
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
