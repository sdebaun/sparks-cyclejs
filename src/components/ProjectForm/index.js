import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'
import ComingSoon from 'components/ComingSoon'
import {div} from 'cycle-snabbdom'
import {Form,Input,Button} from 'snabbdom-material'

import {log} from 'helpers'

const _DOM = ({name}) =>
  Form({className: 'project'}, [
    Input({
      className: 'name',
      label: 'New Project Name',
      value: name,
    }),
    // need onClick: true or snabbdom-material renders as disabled :/
    name ? div({},[
      Button({className: 'submit', onClick: true, primary: true},['Create']),
      Button(
        {className: 'cancel', onClick: true, secondary: true, flat: true},
        ['Cancel']
      ),
    ]) : null,
  ])

export default sources => {
  const submitClick$ = sources.DOM.select('.submit').events('click')

  const submitForm$ = sources.DOM.select('.project').events('submit')
    .doAction(ev => ev.preventDefault())

  const cancelClick$ = sources.DOM.select('.cancel').events('click')

  const submit$ = Observable.merge(submitClick$, submitForm$)

  const name$ = sources.DOM.select('.name').events('input')
    .pluck('target', 'value')
    .startWith('')

  const clearFormData$ = cancelClick$
    .map(() => ({}))

  const formData$ = combineLatestObj({name$})

  const editProject$ = (sources.project$ || Observable.empty())
    .merge(formData$)
    .merge(clearFormData$)
    .distinctUntilChanged()

  const project$ = editProject$
    .sample(submit$)

  // const project$ = (sources.project$ || Observable.empty())
  //   .merge(formData$)
  //   .distinctUntilChanged()

  editProject$.subscribe(log('project$'))

  const DOM = editProject$.startWith({}).map(_DOM)

  return {
    DOM,
    project$,
  }
}
