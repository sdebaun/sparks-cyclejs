import {Observable} from 'rx'
import ComingSoon from 'components/ComingSoon'
import {div} from 'cycle-snabbdom'
import {Form,Input,Button} from 'snabbdom-material'

function createProject(payload) {
  return {
    domain: 'Projects',
    action: 'create',
    uid: '1234',
    payload,
  }
}

const DOMx = state$ =>
  state$.map(({projects, name}) =>
    Form({}, [
      Input({
        className: 'admin-input',
        label: 'New Project Name',
        value: name,
      }),
      Button({className: 'admin-button'},['Create']),
    ]),
  )

const ProjectForm = sources => {
  const input$ = sources.DOM.select('.admin-input').events('input')
  const click$ = sources.DOM.select('.admin-button').events('click')

  const project$ = click$.withLatestFrom(input$) // join auth$ here for uid
    .map(([_,name]) => createProject({name}))
    .startWith(null)
    .distinctUntilChanged()

  const state$ = Observable.combineLatest(
    input$, click$, project$,
    (input, click, project) => ({input, click, project})
  )

  return {
    DOM: DOMx(state$),
    project$: project$.filter(x => x !== null),
  }
}
