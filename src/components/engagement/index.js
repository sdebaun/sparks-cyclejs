/* no cycle-hmr */
import {EngagementItem} from './EngagementItem'
import {EngagementNav} from './EngagementNav'
import {EngagementPriorityList} from './EngagementPriorityList'
import {EngagementButtons} from './EngagementButtons'

export {
  EngagementItem,
  EngagementNav,
  EngagementPriorityList,
  EngagementButtons,
}

export const label = ({isApplied, isAccepted, isConfirmed}) =>
  isConfirmed && 'Confirmed' ||
    isAccepted && 'Accepted' ||
      isApplied && 'Applied' ||
        'Unknown'
