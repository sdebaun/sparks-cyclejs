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

const DOM = props$ =>
  props$.map(({input}) =>
    Form({}, [
      Input({
        className: 'admin-input',
        label: 'New Project Name',
        value: input,
      }),
      Button({className: 'admin-button'},['Create']),
    ]),
  )

export default sources => {
  const click$ = sources.DOM.select('.admin-button').events('click')

  const input$ = sources.DOM.select('.admin-input').events('input')
    .map(e => e.target.value)
    .merge(click$.map(() => ''))
    .startWith('')

  const project$ = click$.withLatestFrom(input$) // join auth$ here for uid
    .map(([_,name]) => createProject({name}))
    .startWith(null)
    .distinctUntilChanged()

  const viewProps$ = Observable.combineLatest(
    project$, input$,
    (project, input) => ({project, input})
  )

  return {
    DOM: DOM(viewProps$),
    project$: project$.filter(x => x !== null),
  }
}
