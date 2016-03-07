import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'
import ComingSoon from 'components/ComingSoon'
import {div} from 'cycle-snabbdom'
import {Form,Input,Button} from 'snabbdom-material'

import {log} from 'helpers'

const _DOM = ({name}) =>
  Form({}, [
    Input({
      className: 'admin-name',
      label: 'New Project Name',
      value: name,
    }),
    Button({className: 'admin-button'},['Create']),
  ])

export default sources => {
  const click$ = sources.DOM.select('.admin-button').events('click')

  const name$ = sources.DOM.select('.admin-name').events('input')
    .pluck('target', 'value')
    .startWith('')

  const formData$ = combineLatestObj({name$})
    .sample(click$)

  const project$ = (sources.project$ || Observable.empty())
    .merge(formData$)
    .distinctUntilChanged()

  project$.subscribe(log('project$'))

  const DOM = project$.startWith({}).map(_DOM)

  // const DOM = project$.mapObservable.combineLatest(
  //   project$, name$,
  //   (project, name) => ({project, name})
  // ).map(_DOM)

  return {
    DOM,
    project$,
  }
}
