import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import {textarea} from 'cycle-snabbdom'
import submitAndCancel from 'helpers/submitAndCancel'

import listItem from 'helpers/listItem'
import {col, div} from 'helpers'

import {log} from 'util'

const _openActions$ = ({DOM}) => Observable.merge(
  DOM.select('.clickable').events('click').scan((a) => !a, false),
)

const _submitAction$ = ({DOM}) =>
  DOM.select('.submit').events('click').map(true)

export default ({title, className, iconName}) => sources => {
  // render is nested so it can use factory args
  const _render = ({value, isOpen}) =>
    col(
      listItem({
        iconName,
        className,
        title,
        clickable: true,
      }),
      isOpen && div({},[
        textarea({class: {input: true}},[value]),
        submitAndCancel(
          'This sounds great',
          'Ditch these changes',
        ),
      ]),
    )

  const input$ = sources.DOM.select('.input').events('input')
  input$.subscribe(log('input$'))
  // input$.pluck('target','value').subscribe(x => console.log(x.length))

  const isOpen$ = _openActions$(sources)
    // .merge(submit$.map(false))
    .startWith(false)

  const submit$ = _submitAction$(sources)

  const value$ = input$.pluck('target','value')
    .sample(submit$)

  const viewState = {
    isOpen$,
    value$: sources.value$ || Observable.just(null),
  }

  const DOM = combineLatestObj(viewState).map(_render)

  return {DOM, value$}
}
