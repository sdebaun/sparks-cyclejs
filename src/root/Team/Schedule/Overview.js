import {Observable} from 'rx'
const {of} = Observable
import {InputControl} from 'components/sdm'
import {RaisedButton} from 'components/sdm'
import {combineLatestToDiv} from 'util'

export default (sources) => {
  const ic = InputControl({
    label$: of('Choose a day to start adding shifts! (YYYY-MM-DD)'), ...sources,
  })
  const rb = RaisedButton({label$: of('Add Date'), ...sources})
  return {
    DOM: combineLatestToDiv(ic.DOM, rb.DOM),
    value$: ic.value$.sample(rb.click$),
  }
}
