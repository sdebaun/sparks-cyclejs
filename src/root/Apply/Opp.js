import {Observable} from 'rx'
const {just, merge, combineLatest} = Observable

// import isolate from '@cycle/isolate'

import {h5} from 'cycle-snabbdom'
import {div} from 'helpers'

import {CommitmentItemPassive} from 'components/commitment'

import {
  ListItem,
  ListItemHeader,
  ListWithHeader,
  RaisedButton,
  SelectControl,
} from 'components/sdm'

import {
  Opps,
  Commitments,
  Engagements,
} from 'components/remote'

import {
  QuotingListItem,
  TitleListItem,
  LoginButtons,
} from 'components/ui'

const _Select = sources => SelectControl({...sources,
  label$: just('Choose another opportunity...'),
  options$: sources.opps$.map(opps => [
    // {value: 0, label: 'Choose another opportunity...'},
    ...opps.map(({name,$key}) => ({value: $key, label: name})),
  ]),
  value$: just(false),
})

const Chooser = sources => {
  const projectKey$ = sources.projectKey$.share()
  const opps$ = sources.opps$.shareReplay(1)
  const select = _Select({...sources, opps$})
  const li = ListItem({...sources,
    projectKey$,
    opps$,
    title$: select.DOM,
  })

  const route$ = select.value$
    .filter(v => !!v)
    .withLatestFrom(
      projectKey$,
      (ok, pk) => `/apply/${pk}/opp/${ok}`
    ).share()

  return {
    DOM: li.DOM,
    route$,
  }
}

const _redirectResponses = ({responses$}) => responses$
  .filter(({domain,event}) => domain === 'Engagements' && event === 'create')
  .map(response => '/engaged/' + response.payload + '/application/question')

const Title = sources => TitleListItem({...sources,
  title$: sources.opp$.pluck('name'),
})

const Quote = sources => QuotingListItem({...sources,
  title$: sources.opp$.map(({description}) => description || 'No Description'),
  profileKey$: sources.project$.pluck('ownerProfileKey'),
})

const CommitmentList = sources => ListWithHeader({...sources,
  headerDOM: ListItemHeader(sources).DOM,
  Control$: just(CommitmentItemPassive),
})

export default sources => {
  // get the remote data we need
  const oppKey$ = sources.oppKey$

  const opp$ = oppKey$
    .flatMapLatest(Opps.query.one(sources))

  const commitments$ = oppKey$
    .flatMapLatest(Commitments.query.byOpp(sources))

  const userEngagments$ = sources.userProfileKey$
    .flatMapLatest(Engagements.query.byUser(sources))

  const hasPriorEngagmentsForOpp$ = userEngagments$.withLatestFrom(oppKey$,
    (engs, oppKey) => engs.filter(e => e.oppKey === oppKey)
  ).map(engs => engs.length > 0 ? true : false)

  const _sources = {...sources, opp$, oppKey$, commitments$}

  // delegate to controls
  const title = Title(_sources)
  const chooser = Chooser(_sources)
  const desc = Quote(_sources)
  const logins = LoginButtons(sources)

  const applyNow = RaisedButton({...sources,
    label$: just('Apply Now!'),
  })

  const gives = CommitmentList({...sources,
    title$: just('you GIVE'),
    rows$: commitments$.map(cs => cs.filter(({party}) => party === 'vol')),
  })

  const gets = CommitmentList({...sources,
    title$: just('you GET'),
    rows$: commitments$.map(cs => cs.filter(({party}) => party === 'org')),
  })

  // combine controls to make sinks
  const newApplication$ = combineLatest(
    oppKey$,
    sources.userProfileKey$,
    (oppKey, userProfileKey) => ({oppKey, profileKey: userProfileKey}),
  )

  const queue$ = newApplication$
    .sample(applyNow.click$)
    .map(Engagements.action.create)

  const route$ = merge(
    _redirectResponses(sources),
    chooser.route$,
  ).share()

  const DOM = combineLatest(
    hasPriorEngagmentsForOpp$,
    sources.auth$,
    applyNow.DOM,
    logins.DOM,
    title.DOM,
    chooser.DOM,
    desc.DOM,
    gives.DOM,
    gets.DOM,
    (hasApplied, auth, anDOM, lDOM, ...doms) => div({},[
      ...doms,
      auth ? // eslint-disable-line no-nested-ternary
        hasApplied ?
          h5(`You've already applied for this opportunity!`) :
          anDOM :
        lDOM,
    ])
  )

  return {
    DOM,
    auth$: logins.auth$,
    queue$,
    route$,
  }
}
