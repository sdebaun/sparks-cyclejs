import {Observable} from 'rx'
const {just, merge, combineLatest} = Observable

import isolate from '@cycle/isolate'

import {div} from 'helpers'

import {
  ListItemNavigating,
} from 'components/sdm'

const WhatItem = sources => ListItemNavigating({...sources,
  title$: just('Tell applicants about this Opportunity.'),
  iconName$: just('power'),
  path$: just('/manage'),
})

const ExchangeItem = sources => ListItemNavigating({...sources,
  title$: just('Determine the Energy Exchange you\'re offering.'),
  iconName$: just('balance-scale'),
  path$: just('/manage/exchange'),
})

const HowItem = sources => ListItemNavigating({...sources,
  title$: just('What Teams can be filled by this Opportunity?'),
  iconName$: just('users'),
  path$: just('/manage/applying'),
})

const applicantsTitle = (applicants) =>
  `Aprrove some of your ${applicants.length} open applications`

const ApplicantItem = sources =>
  ListItemNavigating({
    ...sources,
    title$: sources.applicants$ && sources.applicants$.map(applicantsTitle) ||
      just('Approve applications'),
    path$: just('/engaged/applied'),
    iconName$: just('calendar-check-o'), // TODO: decide on a better icon
  })

export default sources => {
  const what = isolate(WhatItem,'what')(sources)
  const exchange = isolate(ExchangeItem,'invite')(sources)
  const how = isolate(HowItem,'how')(sources)
  const applicants = isolate(ApplicantItem, 'applicants')(sources)

  const items = [what, exchange, how, applicants]

  const route$ = merge(...items.map(i => i.route$))
    .map(sources.router.createHref)

  const DOM = combineLatest(
    ...items.map(i => i.DOM),
    (...doms) => div({},doms)
  )

  return {
    DOM,
    // queue$,
    route$,
  }
}
