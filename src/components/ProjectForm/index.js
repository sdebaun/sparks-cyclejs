import {Observable} from 'rx'
import ComingSoon from 'components/ComingSoon'
import {div} from 'cycle-snabbdom'
import {Form,Input,Button} from 'snabbdom-material'

function createProject(uid, payload) {
  return {
    domain: 'Projects',
    action: 'create',
    uid,
    payload,
  }
}

const _DOM = ({input}) =>
  Form({}, [
    Input({
      className: 'admin-input',
      label: 'New Project Name',
      value: input,
    }),
    Button({className: 'admin-button'},['Create']),
  ])

export default sources => {
  const click$ = sources.DOM.select('.admin-button').events('click')

  const input$ = sources.DOM.select('.admin-input').events('input')
    .map(e => e.target.value)
    .merge(click$.map(() => ''))
    .startWith('')

  const project$ = click$.withLatestFrom(input$, sources.auth$)
    .map(([_,name, auth]) => createProject(auth.uid, {name}))
    .startWith(null)
    .distinctUntilChanged()

  const DOM = Observable.combineLatest(
    project$, input$,
    (project, input) => ({project, input})
  ).map(_DOM)

  return {
    DOM,
    project$: project$.filter(x => x !== null),
  }
}
