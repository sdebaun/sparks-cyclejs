import {
  RaisedButton,
} from 'components/sdm'

const ActionButton = sources => {
  const b = RaisedButton(sources)
  return {
    action$: b.click$.withLatestFrom(
      sources.params$,
      (_, params) => params
    ),
    DOM: b.DOM,
  }
}

export {ActionButton}
