import {Observable} from 'rx'
import ComingSoon from 'components/ComingSoon'
import {div} from 'cycle-snabbdom'
import {Form,Input,Button} from 'snabbdom-material'

function intent(DOM) {
  const input$ = DOM.select('.admin-input').events('input')
  const click$ = DOM.select('.admin-button').events('click')
  return {
    input$,
    click$,
  }
}

function createProject([_, name]) {
  return {
    domain: 'Projects',
    action: 'create',
    uid: '1234',
    payload: {name},
  }
}

function model(actions, sources) {
  const name$ = actions.input$
    .map(evt => evt.target.value)
    .merge(actions.click$.map(() => ''))
    .startWith('')

  const project$ = sources.firebase('Projects')
    .startWith([])

  const newProject$ = actions.click$.withLatestFrom(name$)
    .map(createProject)
    .startWith(null)
    .distinctUntilChanged()

  return Observable.combineLatest(
    project$, newProject$, name$,
    (projects, newProject, name) => ({projects, newProject, name})
  )
}

const rows = obj =>
  Object.keys(obj).map(k => ({$key: k, ...obj[k]}))

const renderProjects = projects =>
  rows(projects).map(({name}) => div({}, [name]))

const view = state$ =>
  state$.map(({projects, name}) => div({}, [
    Form({}, [
      Input({
        className: 'admin-input',
        label: 'New Project Name',
        value: name,
      }),
      Button({className: 'admin-button'},['Create']),
    ]),
    div({}, renderProjects(projects)),
  ])
)

export default sources => {
  const actions = intent(sources.DOM)
  const state$ = model(actions, sources)
  const view$ = view(state$)

  return {
    DOM: view$,
    queue$: state$.pluck('newProject').filter(x => x !== null),
  }
}
