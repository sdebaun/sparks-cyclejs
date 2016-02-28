import ComingSoon from 'components/ComingSoon'
import {div} from 'cycle-snabbdom'

const rows = obj =>
  Object.keys(obj).map(k => ({$key: k, ...obj[k]}))

export default sources => {
  const projects$ = sources.firebase('Projects')

  return {
    DOM: projects$.map(projects =>
      div({},[
        div({},[
          'Add form',
        ]),
        div({}, // this should be a list() helper
          rows(projects).map(project =>
            // these end up being components whose DOMs return listItem
            div({},project.name)
          )
        ),
      ])
    ),
  }
}
