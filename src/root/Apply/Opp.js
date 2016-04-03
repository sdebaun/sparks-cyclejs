import {Observable} from 'rx'
const {just, merge, combineLatest} = Observable

// import isolate from '@cycle/isolate'

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

// import {log} from 'util'

const _Select = sources => SelectControl({...sources,
  label$: just('Choose another opportunity...'),
  options$: sources.opps$.map(opps => [
    // {value: 0, label: 'Choose another opportunity...'},
    ...opps.map(({name,$key}) => ({value: $key, label: name})),
  ]),
  value$: just(false),
})

const Chooser = sources => {
  const select = _Select(sources)
  const li = ListItem({...sources,
    title$: select.DOM,
  })

  const route$ = select.value$
    .filter(v => !!v)
    .withLatestFrom(
      sources.projectKey$,
      (ok, pk) => `/apply/${pk}/opp/${ok}`
    )

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
  )

  // route$.subscribe(log('route$'))

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
