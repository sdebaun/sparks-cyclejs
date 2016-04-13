import {Observable} from 'rx'
const {just, merge, combineLatest} = Observable

import {div, h5, p, hr} from 'cycle-snabbdom'
import {iconSrc} from 'helpers'

import {log} from 'util'
import {combineLatestToDiv} from 'util'

import {
  List,
  ListItem,
  ListItemWithDialog,
  ListItemNavigating,
} from 'components/sdm'

import {
  EngagementButtons,
} from 'components/engagement'
// import {OkAndCancel} from 'components/sdm/Button'

import {
  Profiles,
  Engagements,
  Memberships,
  Teams,
} from 'components/remote'

const QuoteListItem = sources =>
  ListItem({...sources,
    subtitle$: just('Applicant'),
    classes$: just({quote: true, yellow: true})}).DOM

const RightQuoteListItem = sources =>
  ListItem({...sources,
    subtitle$: just('Project Owner'),
    classes$: just({quote: true, rotate: true, blue: true})}).DOM

const toValues = value => {
  switch (value) {
  case 'priority': return {isAccepted: true, priority: true, declined: false}
  case 'accept': return {isAccepted: true, priority: false, declined: false}
  case 'decline': return {isAccepted: false, priority: false, declined: true}
  default: return {isAccepted: 'false', declined: false}
  }
}

const defaultIntro =
  'This applicant has not completed the intro section of their profile'
const defaultSkills =
  'This applicant has not completed the skills section of their profile'
const defaultOppAnswer =
  'This applicant did not answer the opportunity question'
const defaultTeamAnswer =
  'This applicant did not answer the team question'

const dialogStyle = { // TODO: move into scss
  maxWidth: '31rem',
  margin: '0 auto',
  maxHeight: '37rem',
  overflow: 'auto',
  paddingLeft: '1em',
  paddingRight: '1em',
}

const dialogView = (
  {intro = defaultIntro, skills = defaultSkills, portraitUrl}, // user profile
  {opp: {question: oppQuestion}, answer: oppAnswer = defaultOppAnswer}, //item
  {answer: teamAnswer = defaultTeamAnswer}, // membership
  {question: teamQuestion}, // team
  {portraitUrl: ownerPicUrl}, // project Owner Profile
) =>
  div({style: dialogStyle}, [
    div({}, [
      h5({style: {textDecoration: 'underline'}}, ['Introduction']),
      p({style: {fontWeight: 'bold'}}, intro),
    ]),
    hr({}, []),
    div({}, [
      RightQuoteListItem({
        title$: just(oppQuestion),
        subtitle$: just('Project Owner'),
      }),
    ]),
    div({style: {display: 'flex', flexDirection: 'row'}}, [
      div({style: {flexGrow: '1'}}, [
        QuoteListItem({
          title$: just(oppAnswer),
          subtitle$: just('Applicant'),
        }),
      ]),
      div({style: {margin: '0.4em'}} , [iconSrc(ownerPicUrl)]),
    ]),
    div({style: {display: 'flex', flexDirection: 'row'}}, [
      div({style: {marginTop: '-0.6em'}}, [iconSrc(portraitUrl)]),
      div({style: {flexGrow: '1'}}, [
        RightQuoteListItem({title$: just(teamQuestion)}),
      ]),
    ]),
    div({style: {display: 'flex', flexDirection: 'row'}}, [
      div({style: {flexGrow: '1'}}, [
        QuoteListItem({title$: just(teamAnswer)}),
      ]),
      div({style: {margin: '0.4em'}}, [iconSrc(ownerPicUrl)]),
    ]),
    div({style: {display: 'flex', flexDirection: 'row'}}, [
      div({style: {marginTop: '-0.6em'}}, [
        iconSrc(portraitUrl),
      ]),
      h5({style: {textAlign: 'center', flexGrow: '1'}}, 'Other Skills'),
    ]),
    hr({}, []),
    div({}, [
      p({}, skills),
    ]),
  ])

const Item = sources => {
  const item$ = sources.item$.shareReplay(1)
  const memberships$ = sources.engagements$
    .pluck('$key')
    .flatMapLatest(Memberships.query.byEngagement(sources))
    .map(arr => arr[0])
    .shareReplay(1)

  const team$ = memberships$
    .pluck('teamKey')
    .flatMapLatest(Teams.query.one(sources))

  const profile$ = item$
    .pluck('profileKey')
    .flatMapLatest(Profiles.query.one(sources))
    .shareReplay(1)

  const ownerProfile$ = team$
    .pluck('project', 'ownerProfileKey')
    .flatMapLatest(Profiles.query.one(sources))
    .shareReplay(1)

  const dialogContentDOM$ = combineLatest(
    profile$, item$, memberships$, team$, ownerProfile$,
    dialogView
  )

  const actionsComponent$ = just(EngagementButtons(sources))

  const isOpen$ = sources.lastIndex$
    .combineLatest(sources.index$,
      (lastIndex, index) => index === lastIndex.index && lastIndex.isOpen
    )
    .replay(null, 1)

  isOpen$.connect()

  const {DOM, value$, submit$, close$} = ListItemWithDialog({...sources,
    title$: profile$.pluck('fullName'),
    iconUrl$: profile$.pluck('portraitUrl'),
    dialogTitleDOM$: profile$.pluck('fullName')
      .map(fullName => `${fullName}'s Application`),
    dialogContentDOM$,
    actionsComponent$,
    isOpen$,
  })

  const queue$ = value$.map(toValues)
    .withLatestFrom(item$.pluck('$key'),
      (values, key) => ({key, values})
    )
    .map(Engagements.action.update)

  const lastIndex$ = Observable
    .merge(
      submit$.map(true),
      close$.map(false)
    )
    .withLatestFrom(sources.index$,
      (isOpen, index) => ({isOpen, index})
    )
    .shareReplay(1)

  return {DOM, queue$, lastIndex$}
}

import Detail from './Detail'

const Item2 = sources => {
  const profile$ = sources.item$
    .pluck('profileKey')
    .flatMapLatest(Profiles.query.one(sources))
    .shareReplay(1)

  return ListItemNavigating({...sources,
    title$: profile$.pluck('fullName'),
    iconSrc$: profile$.pluck('portraitUrl'),
    path$: sources.item$.map(({$key}) =>
      sources.router.createHref(`/show/${$key}`)
    ),
  })
}

const AppList = sources => List({...sources,
  Control$: just(Item2),
  rows$: sources.engagements$,
})

const EmptyNotice = sources => ({
  DOM: sources.items$.map(i =>
    i.length > 0 ? null : div({},['Empty notice'])
  ),
})

const isNotAccepted = ({isAccepted}) => isAccepted === false
const isDeclined = ({declined}) => declined === true

const Fetch = sources => ({
  engagements$: sources.oppKey$
    .flatMapLatest(Engagements.query.byOpp(sources))
    .map(engagements =>
      engagements.filter(x => !isDeclined(x) && isNotAccepted(x))
    )
    .shareReplay(1),
})

export default sources => {
  const _sources = {...sources, ...Fetch(sources)}

  const detail = Detail(_sources)
  const list = AppList(_sources)
  const mt = EmptyNotice({..._sources, items$: _sources.engagements$})

  return {
    DOM: combineLatestToDiv(mt.DOM, list.DOM, detail.DOM),
    route$: merge(list.route$, detail.route$),
  }
}
