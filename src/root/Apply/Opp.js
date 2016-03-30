import {Observable} from 'rx'
const {just, combineLatest} = Observable

import combineLatestObj from 'rx-combine-latest-obj'
import {PROVIDERS} from 'util'

import {rows} from 'util'
import {log} from 'util'

import {div, col} from 'helpers'
import listItem from 'helpers/listItem'

import {textQuote} from 'helpers/text'
import {centeredSignup, bigButton} from 'helpers/buttons'

// import {Engagements} from 'remote'

import {CommitmentItemPassive} from 'components/commitment'

import {
  ListItem,
  ListWithHeader,
} from 'components/sdm'

import codeIcons from 'components/opp/codeIcons'
import codeTitles from 'components/opp/codeTitles'

import {
  Opps,
  Commitments,
  Engagements,
} from 'components/remote'

import {
  LoginButtons,
} from 'components/ui'

const _renderOppHeader = (project, opp) =>
  col(
    textQuote(opp.description),
  )

const _renderCommitments = (title, commitmentRows) =>
  col(
    listItem({
      title,
      header: true,
    }),
    ...commitmentRows.map(({code, ...vals}) =>
      listItem({
        title: codeTitles[code](vals),
        iconName: codeIcons[code],
        className: 'commitment',
        clickable: true,
      }),
    )
  )

const _render = ({
  project,
  opp,
  commitments,
  userProfile,
}) =>
  col(
    _renderOppHeader(project,opp),
    _renderCommitments(
      'you GIVE',
      rows(commitments).filter(c => c.party === 'vol')
    ),
    _renderCommitments(
      'you GET',
      rows(commitments).filter(c => c.party === 'org')
    ),
    userProfile ? bigButton('Apply Now!','apply') : centeredSignup(),
  )

const _redirectResponses = ({responses$}) => responses$
  .filter(({domain,event}) => domain === 'Engagements' && event === 'create')
  .map(response => '/engaged/' + response.payload)

const DescriptionListItem = sources => ListItem({...sources,
  title$: sources.item$.pluck('description'),
  classes$: just('description'), // no styling yet but here's where
})

const ListItemHeader = sources =>
  ListItem({...sources, classes$: just({header: true})})

const GiveList = sources => ListWithHeader({...sources,
  headerDOM: ListItemHeader({...sources, title$: just('you GIVE')}).DOM,
  // headerDOM: just(div({},['wat'])),
  Control$: just(CommitmentItemPassive),
})

export default sources => {
  const oppKey$ = sources.oppKey$
  oppKey$.subscribe(log('oppKey$'))

  const opp$ = oppKey$
    .flatMapLatest(Opps.query.one(sources))

  const commitments$ = oppKey$
    .flatMapLatest(Commitments.query.byOpp(sources))

  const applyClick$ = sources.DOM.select('.apply').events('click')

  const newApplication$ = combineLatest(
    oppKey$,
    sources.userProfileKey$,
    (oppKey, userProfileKey) => ({oppKey, profileKey: userProfileKey}),
  )

  const desc = DescriptionListItem({...sources, item$: opp$})

  const logins = LoginButtons(sources)

  const gives = GiveList({...sources,
    // rows$: just([]),
    rows$: commitments$
      .map(cs => cs.filter(({party}) => party === 'vol')),
  })
  // const auth$ = _authActions(sources)

  const queue$ = newApplication$
    .sample(applyClick$)
    .map(Engagements.action.create)

  const route$ = _redirectResponses(sources)

  // const viewState = {
  //   project$: sources.project$,
  //   userProfile$: sources.userProfile$,
  //   opp$,
  //   commitments$,
  // }

  // const DOM = combineLatestObj(viewState).map(_render)

  const DOM = combineLatest(
    desc.DOM,
    gives.DOM,
    logins.DOM,
    (...doms) => div({},doms)
  )

  return {
    DOM,
    auth$: logins.auth$,
    queue$,
    route$,
  }
}
