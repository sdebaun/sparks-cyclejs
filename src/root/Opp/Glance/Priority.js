import {Observable} from 'rx'
const {just, merge, combineLatest, empty} = Observable

import isolate from '@cycle/isolate'

import {div} from 'helpers'

import {Engagements, Opps} from 'components/remote'

import {
  // ListItemNewTarget,
  ListItemNavigating,
  ListItemToggle,
} from 'components/sdm'

import {RecruitmentLinkItem} from '../RecruitmentLinkItem'

// const PreviewItem = sources => ListItemNewTarget({...sources,
//   title$: just('Check out your Recruiting page.'),
//   iconName$: just('link'),
//   url$: combineLatest(
//     sources.projectKey$, sources.oppKey$,
//     (pk, ok) => '/apply/' + pk + '/opp/' + ok
//   ),
// })

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

const isNotAccepted = ({isAccepted}) => isAccepted === false
const isDeclined = ({declined}) => declined === true

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
    title$: sources.engagements$
      .map(e => e.filter(x => !isDeclined(x) && isNotAccepted(x)))
      .map(applicantsTitle),
    iconName$: sources.engagements$.map(applicantsIcon),
    path$: sources.engagements$.map(applicantsPath),
  })

const ConfirmationToggle = (sources) =>
  ListItemToggle({
    ...sources,
    value$: sources.opp$.map(opp => opp.confirmationsOn),
    titleTrue$: just('Confirmations are off and no confirmation emails are ' +
      'being sent to applicants.'),
    titleFalse$: just('Confirmations are now on, and acceptance emails are ' +
      'being sent as applications are approved.'),
  })

export default sources => {
  const engagements$ = sources.oppKey$
    .map(Engagements.query.byOpp(sources)).switch()
    .shareReplay(1)

  const preview = isolate(RecruitmentLinkItem)(sources)
  const what = isolate(WhatItem,'what')(sources)
  const exchange = isolate(ExchangeItem,'invite')(sources)
  const how = isolate(HowItem,'how')(sources)
  const applicants = isolate(ApplicantItem, 'applicants')({...sources,
    engagements$,
  })
  const confirmations = isolate(ConfirmationToggle, 'confirmations')(sources)

  const items = [preview, what, exchange, how, applicants]

  const queue$ = confirmations.value$
    .withLatestFrom(sources.oppKey$,
      (confirmationsOn, key) => ({key, values: {confirmationsOn}})
    )
    .map(Opps.action.update)

  const route$ = merge(...items.map(i => i.route$ || empty()))
    .map(sources.router.createHref)

  const DOM = combineLatest(
    ...items.map(i => i.DOM),
    (...doms) => div({}, [confirmations.DOM, ...doms])
  )

  return {
    DOM,
    queue$,
    route$,
  }
}
