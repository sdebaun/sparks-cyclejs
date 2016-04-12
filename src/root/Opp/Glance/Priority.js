import {Observable} from 'rx'
const {just, merge, combineLatest} = Observable

import isolate from '@cycle/isolate'

import {div} from 'helpers'

import {Engagements} from 'components/remote'

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

const applicantsTitle = (engagements) => {
  switch (engagements.length) {
  case 0: return `You currently have no applications awaiting approval.`
  case 1: return `You have 1 application awaiting approval!`
  default: return `Approve some of the ${engagements.length} applications awaiting approval!` //eslint-disable-line max-len
  }
}

const applicantsPath = (engagements) =>
  engagements.length === 0 ? `/` : `/engaged/applied/`

const applicantsIcon = (engagements) => // TODO: better icons?
  engagements.length === 0 ? `event_busy` : `event_available`

const ApplicantItem = sources =>
  ListItemNavigating({
    ...sources,
    title$: sources.engagements$.map(applicantsTitle),
    iconName$: sources.engagements$.map(applicantsIcon),
    path$: sources.engagements$.map(applicantsPath),
  })

export default sources => {
  const engagements$ = sources.oppKey$
    .map(Engagements.query.byOpp(sources)).switch()
    .shareReplay(1)

  const what = isolate(WhatItem,'what')(sources)
  const exchange = isolate(ExchangeItem,'invite')(sources)
  const how = isolate(HowItem,'how')(sources)
  const applicants = isolate(ApplicantItem, 'applicants')({...sources,
    engagements$,
  })

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
