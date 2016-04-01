import {Observable} from 'rx'
const {just, combineLatest} = Observable

// import isolate from '@cycle/isolate'

import {div} from 'helpers'

import {CommitmentItemPassive} from 'components/commitment'

import {
  ListItemHeader,
  ListWithHeader,
  RaisedButton,
} from 'components/sdm'

import {
  Opps,
  Commitments,
  Engagements,
} from 'components/remote'

import {
  QuotingListItem,
  DescriptionListItem,
  TitleListItem,
  LoginButtons,
} from 'components/ui'

// import {log} from 'util'

const _redirectResponses = ({responses$}) => responses$
  .filter(({domain,event}) => domain === 'Engagements' && event === 'create')
  .map(response => '/engaged/' + response.payload + '/application/question')

const Title = sources => TitleListItem({...sources,
  title$: sources.opp$.pluck('name'),
})

const Chooser = sources => ({
  DOM: just(div({},['look at another opportunity'])),
})

const Quote = sources => QuotingListItem({...sources,
  title$: sources.opp$.map(({description}) => description || 'No Description'),
  profileKey$: sources.opp$.map(({project}) => project.ownerProfileKey),
})

const CommitmentList = sources => ListWithHeader({...sources,
  headerDOM: ListItemHeader(sources).DOM,
  Control$: just(CommitmentItemPassive),
})

// const Description = sources => DescriptionListItem({...sources,
//   item$: sources.opp$,
// })

export default sources => {
  // get the remote data we need
  const oppKey$ = sources.oppKey$

  const opp$ = oppKey$
    .flatMapLatest(Opps.query.one(sources))

  const commitments$ = oppKey$
    .flatMapLatest(Commitments.query.byOpp(sources))

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

  const route$ = _redirectResponses(sources)

  const DOM = combineLatest(
    sources.auth$,
    applyNow.DOM,
    logins.DOM,
    title.DOM,
    chooser.DOM,
    desc.DOM,
    gives.DOM,
    gets.DOM,
    (auth, anDOM, lDOM, ...doms) => div({},[
      ...doms,
      auth ? anDOM : lDOM,
    ])
  )

  return {
    DOM,
    auth$: logins.auth$,
    queue$,
    route$,
  }
}
