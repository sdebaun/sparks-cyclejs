import {NavClicker} from 'components'
import listItem from 'helpers/listItem'
import {div} from 'cycle-snabbdom'

export const ProjectList = sources => ({
  route$: NavClicker(sources).route$,

  DOM: sources.projects$.map(projects =>
    div({}, projects.map(({name,$key}) =>
      listItem(
        {title: name, subtitle: 'project',
        link: '/project/' + $key, className: 'project.nav'}
      )
    ))
  ),
})

