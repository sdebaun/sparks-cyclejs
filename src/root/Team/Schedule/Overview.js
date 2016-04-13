import {Observable} from 'rx'
const {of} = Observable
import {InputControl} from 'components/sdm'
import {RaisedButton} from 'components/sdm'
import {combineLatestToDiv} from 'util'

export default (sources) => {
  const ic = InputControl({
    label$: of('Choose a day to start adding shifts! (YYYY-MM-DD)'),
    ...sources,
  })
  const rb = RaisedButton({label$: of('Add Date'), ...sources})
  const route$ = ic.value$
    .sample(rb.click$)
    .combineLatest(
      sources.teamKey$,
      (date, team) => `/team/${team}/schedule/${date}`
    )
  return {
    DOM: combineLatestToDiv(ic.DOM, rb.DOM),
    route$,
  }
}
