// TODO: textarea -> sdm

import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import {textarea, h6} from 'cycle-snabbdom'
import {submitAndCancel} from 'helpers/buttons'

import listItem from 'helpers/listItem'
import {col, div} from 'helpers'

// import {log} from 'util'

const _openActions$ = ({DOM}) => Observable.merge(
  DOM.select('.clickable').events('click').scan((a) => !a, false),
)

const _submitAction$ = ({DOM}) =>
  DOM.select('.submit').events('click').map(true)

const divStyle = {
  border: '2px solid rgb(0, 150, 136)',
  width: 'auto',
  display: 'flex',
}

const textAreaStyle = (height) => ({
  overflow: 'hidden',
  padding: '1em',
  paddingRight: '6em',
  height,
  minHeight: '3em',
  width: '100%',
  lineHeight: '16px',
  zIndex: 1,
})

const labelStyle = (height) => ({
  zIndex: 5,
  position: 'absolute',
  fontSize: '1.25em',
  fontWeight: 'lighter',
  textAlign: 'right',
  display: 'inline',
  right: '0',
  marginRight: '.8em',
  marginTop: `calc(${height} - 1.8em)`,
  padding: '0.1em',
  border: '2px solid rgb(0, 150, 136)',
})

const _render = ({iconName, className, title, maxLength}) =>
  ({value, length, isOpen, height}) =>
    col(
      listItem({
        iconName,
        className,
        title,
        clickable: true,
      }),
      isOpen && div({}, [
        div({style: divStyle}, [
          textarea({
            props: {maxLength},
            class: {input: true},
            style: textAreaStyle(height),
          }, [
            value,
          ]),
          h6({style: labelStyle(height)}, [`${length}/${maxLength}`]),
        ]),
        div({}, [
          submitAndCancel(
            'This sounds great',
            'Ditch these changes',
          ),
        ]),
      ]),
    )

export default factoryInput => sources => {
  const input = sources.DOM.select('.input')
  const input$ = input.observable

  const inputEvent$ = input.events('input').share()

  const intialLength$ = input$
    .map(elements => elements[0])
    .map(elm => elm ? elm.value : '')
    .pluck('length')
    .distinctUntilChanged()

  const length$ = intialLength$
    .merge(inputEvent$.pluck('target', 'value', 'length'))
    .startWith(0)

  const height$ = input$
    .map(elements => elements[0])
    .map(elm => elm ? elm.scrollHeight + 'px' : 'auto')
    .distinctUntilChanged()
    .startWith('auto')

  const isOpen$ = _openActions$(sources)
    .startWith(false)

  const submit$ = _submitAction$(sources)

  const value$ = inputEvent$.pluck('target','value')
    .sample(submit$)

  const viewState = {
    length$,
    height$,
    isOpen$,
    value$: sources.value$ || Observable.just(null),
  }

  const DOM = combineLatestObj(viewState).map(_render(factoryInput))

  return {DOM, value$}
}
