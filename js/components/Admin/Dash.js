import {ReplaySubject} from 'rx'
import ComingSoon from 'components/ComingSoon'
import {div} from 'cycle-snabbdom'
import {Form,Input,Button} from 'snabbdom-material'

const rows = obj =>
  Object.keys(obj).map(k => ({$key: k, ...obj[k]}))

export default sources => {
  const projects$ = sources.firebase('Projects')
  const name$ = new ReplaySubject(1)
  const submit$ = new ReplaySubject(1)
  const newProject$ = submit$
    .combineLatest(name$)
    .map(([submit,name]) => ({name}))

  return {
    DOM: projects$.map(projects =>
      div({},[
        Form({onSubmit: e => submit$.onNext()},[
          Input({
            label: 'New Project Name',
            onChange: e => name$.onNext(e.target.value),
          }),
          Button({onClick: e => submit$.onNext()},['Create']),
        ]),
        div({}, // this should be a list() helper?
          rows(projects).map(project =>
            // these should be components whose DOMs return listItem() helpers?
            div({},project.name)
          )
        ),
      ])
    ),
    queue$: newProject$,
  }
}
