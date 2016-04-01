import {div, icon} from 'helpers'

import {
  ListItemNavigating,
} from 'components/sdm'

const ToDoListItem = sources => {
  const leftDOM$ = sources.isDone$.map(isDone =>
      div({},[
        isDone ?
        icon('check_box','disabled') :
        icon('chevron-circle-right', 'accent'),
      ])
    )

  return ListItemNavigating({...sources,
    leftDOM$,
    classes$: sources.isDone$.map(isDone => ({disabled: isDone})),
  })
}

export {ToDoListItem}
