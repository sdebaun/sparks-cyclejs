import {Observable} from 'rx'
const {just, merge} = Observable

import combineLatestObj from 'rx-combine-latest-obj'

import {textarea, h6} from 'cycle-snabbdom'

import {div} from 'helpers'

const divStyle = {
  border: '2px solid rgb(0, 150, 136)',
  width: 'auto',
  display: 'flex',
}

// can we make these scss
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

const TextAreaControl = sources => {
  const input = sources.DOM.select('.input')
  const input$ = input.observable
  const height$ = input$
    .map(elements => elements[0])
    .map(elm => elm ? elm.scrollHeight + 'px' : 'auto')
    .distinctUntilChanged()
    .startWith('auto')

  const value$ = input.events('input')
    .pluck('target','value')

  const length$ = merge(
    value$,
    sources.value$ || just(''),
  ).map(v => v && v.length || 0).startWith(0)

  const viewState = {
    value$: sources.value$ || just(''),
    length$,
    maxLength$: sources.maxLength$ || just(160),
    height$,
  }

  const DOM = combineLatestObj(viewState)
    .map(({value, length, maxLength, height}) =>
      div({style: divStyle}, [
        textarea({
          props: {maxLength},
          class: {input: true},
          style: textAreaStyle(height),
        }, [
          value,
        ]),
        h6({style: labelStyle(height)}, [`${length}/${maxLength}`]),
      ])
    )

  return {
    DOM,
    value$,
  }
}

export {TextAreaControl}
