import {
  StepListItem,
} from 'components/ui'

import ChooseShifts from '../Schedule/Priority'

export default sources => {
  const content = ChooseShifts(sources)

  const li = StepListItem({...sources,
    title$: sources.neededAssignments$.map(n => n > 0 ?
      `Step 1: Choose ${n} More Preferred Shifts` :
      `Step 1: Preferred Shifts Selected`
    ),
    // title$: $.just('Step 1: Choose Your Shifts'),
    contentDOM$: content.DOM,
    isOpen$: sources.engagement$.map(({isAssigned}) => !isAssigned),
  })

  return {
    ...li,
    queue$: content.queue$,
  }
}
