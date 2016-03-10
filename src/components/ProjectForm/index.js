import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import {projectForm} from 'helpers'

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

  const DOM = editProject$.startWith({}).map(projectForm)

  return {
    DOM,
    project$,
  }
}
