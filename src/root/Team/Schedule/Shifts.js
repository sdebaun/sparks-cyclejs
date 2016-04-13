import {Observable} from 'rx'
const {of} = Observable
import {ListItemWithDialog} from 'components/sdm'

export default sources => {
  const liwd = ListItemWithDialog({
    ...sources,
    iconName$: of('calendar-check-o'),
    title$: of('Add a shift.'),
    dialogTitleDOM$: of('Add a shift'),
    dialogContentDOM$: of('Shift select incoming.'),
  })
  return {
    DOM: liwd.DOM,
  }
}
