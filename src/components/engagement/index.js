export {EngagementItem} from './EngagementItem'
export {EngagementNav} from './EngagementNav'
export {EngagementPriorityList} from './EngagementPriorityList'
export {EngagementButtons} from './EngagementButtons'

export const label = ({isApplied, isAccepted, isConfirmed}) =>
  isConfirmed && 'Confirmed' ||
    isAccepted && 'Accepted' ||
      isApplied && 'Applied' ||
        'Unknown'
