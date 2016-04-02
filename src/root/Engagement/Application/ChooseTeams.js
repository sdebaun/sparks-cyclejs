import {Observable} from 'rx'
const {just, empty, merge, combineLatest} = Observable
// const {merge} = Observable

// import isolate from '@cycle/isolate'

import {div, icon} from 'helpers'

import {
  ListWithHeader,
  ListItem,
  ListItemClickable,
  // ListItemCollapsibleTextArea,
  ListItemHeader,
  ListItemNavigating,
  CheckboxControl,
  TextAreaControl,
  ListItemCollapsible,
  RaisedButton,
  FlatButton,
} from 'components/sdm'

import {
  QuotingListItem,
  DescriptionListItem,
} from 'components/ui'

import {
  Memberships,
  Fulfillers,
  Teams,
} from 'components/remote'

import {TeamIcon} from 'components/team'

import {log} from 'util'

const Instruct = sources => ListItem({...sources,
  title$: just('Choose one or more Teams that you want to join.'),
})

const TeamMemberLookup = sources => ({
  found$: sources.memberships$.combineLatest(
    sources.teamKey$,
    (memberships, findTeamKey) =>
      memberships.find(({teamKey}) => findTeamKey === teamKey)
  ),
})

const OpenTeamListItem = sources => {
  const cb = CheckboxControl({...sources, value$: sources.membership$})

  const li = ListItemClickable({...sources,
    leftDOM$: TeamIcon(sources).DOM,
    title$: sources.team$.pluck('name'),
    subtitle$: sources.team$.pluck('description'),
    rightDOM$: cb.DOM,
  })

  const queue$ = sources.membership$
    .sample(li.click$)
    .combineLatest(
      sources.teamKey$,
      sources.oppKey$,
      sources.engagementKey$,
      (membership, teamKey, oppKey, engagementKey) =>
        membership ?
        Memberships.action.remove(membership.$key) :
        Memberships.action.create({teamKey, oppKey, engagementKey}),
    )

  queue$.subscribe(log('O.queue$'))

  return {
    DOM: li.DOM,
    queue$,
  }
}

const OkAndCancelAndRemove = sources => {
  const ok = RaisedButton({...sources,
    label$: sources.okLabel$ || just('OK'),
  })
  const remove = RaisedButton({...sources,
    label$: sources.removeLabel$ || just('Remove'),
    classNames$: just(['accent']),
  })
  const cancel = FlatButton({...sources,
    label$: sources.cancelLabel$ || just('Cancel'),
  })

  const doms = [ok, remove, cancel].map(c => c.DOM)

  return {
    DOM: combineLatest(
      sources.value$, ...doms,
      (val, okDOM, rDOM, cDOM) => div({},[
        okDOM,
        val && rDOM || null,
        cDOM,
      ])
    ),
    ok$: ok.click$,
    remove$: remove.click$,
    cancel$: cancel.click$,
  }
}

const ListItemCollapsibleTextArea = sources => {
  const ta = TextAreaControl(sources)
  const li = ListItemCollapsible({...sources,
    contentDOM$: combineLatest(
      sources.topDOM$ || just(null),
      ta.DOM,
      sources.buttonsDOM$,
      (...doms) => div({},doms)
    ),
  })

  return {
    DOM: li.DOM,
    value$: ta.value$,
  }
}

const ListItemCollapsibleTextAreaOKCancelRemove = sources => {
  const buttons = OkAndCancelAndRemove(sources)
  const close$ = merge(
    buttons.cancel$,
    buttons.ok$,
    buttons.remove$,
  ).map(false)

  const li = ListItemCollapsibleTextArea({...sources,
    isOpen$: (sources.isOpen$ || empty())
      .merge(close$),
    buttonsDOM$: buttons.DOM,
  })

  const value$ = merge(
    li.value$.sample(buttons.ok$),
    buttons.remove$.map(false),
  )

  return {
    DOM: li.DOM,
    value$,
  }
}

const _determineAction =
(answer, membership, teamKey, oppKey, engagementKey) => {
  const {update, create, remove} = Memberships.action

  if (answer && membership) {
    return update({key: membership.$key, values: {answer}})
  } else if (answer && !membership) {
    return create({teamKey, oppKey, engagementKey, answer})
  } else if (!answer && membership) {
    return remove(membership.$key)
  } else {
    throw new Error('no answer, and no membership, wat?')
  }
}

const RestrictedTeamListItem = sources => {
  const cb = CheckboxControl({...sources, value$: sources.membership$})

  const q = QuotingListItem({...sources,
    title$: sources.team$.pluck('question'),
    profileKey$: sources.project$.pluck('ownerProfileKey'),
  })

  // const desc = DescriptionListItem({...sources,
  //   item$: sources.team$.pluck('description'),
  // })

  const li = ListItemCollapsibleTextAreaOKCancelRemove({...sources,
    topDOM$: combineLatest(q.DOM, (...doms) => div({},doms)),
    leftDOM$: TeamIcon(sources).DOM,
    title$: sources.team$.pluck('name'),
    subtitle$: sources.team$.pluck('description'),
    rightDOM$: cb.DOM,
    value$: sources.membership$.map(m => m && m.answer || null),
  })

  const queue$ = li.value$
    .withLatestFrom(
      sources.membership$,
      sources.teamKey$,
      sources.oppKey$,
      sources.engagementKey$,
      _determineAction
    )

  queue$.subscribe(log('R.queue$'))

  return {
    DOM: li.DOM,
    queue$,
  }
}

const FulfillerMemberListItem = sources => {
  const teamKey$ = sources.item$.pluck('teamKey')
  const team$ = teamKey$
    .flatMapLatest(Teams.query.one(sources))
  const membership$ = TeamMemberLookup({...sources, teamKey$}).found$

  const childSources = {...sources, teamKey$, team$, membership$}

  const control$ = team$
    .map(({isPublic}) =>
      (isPublic ? OpenTeamListItem : RestrictedTeamListItem)(childSources)
    ).shareReplay(1)

  const queue$ = control$.flatMapLatest(c => c.queue$)
  const DOM = control$.flatMapLatest(c => c.DOM)

  queue$.subscribe(log('LI.queue$'))

  return {
    DOM,
    queue$,
  }
}

const TeamsMembersList = sources => {
  const header = ListItemHeader({...sources,
    title$: just('Available Teams'),
    rightDOM$: combineLatest(
      sources.memberships$.map(m => m.length),
      sources.fulfillers$.map(r => r.length),
      (m,t) => m + '/' + t
    ),
  })

  const sinks = ListWithHeader({...sources,
    headerDOM: header.DOM,
    Control$: just(FulfillerMemberListItem),
    rows$: sources.fulfillers$,
  })

  const queue$ = sinks.queue$.share()

  queue$.subscribe(log('L.queue$'))

  return {...sinks, queue$}
}

const Fetch = sources => {
  const oppKey$ = sources.engagement$.pluck('oppKey')

  const memberships$ = sources.engagementKey$
    .flatMapLatest(Memberships.query.byEngagement(sources))

  const fulfillers$ = oppKey$
    .flatMapLatest(Fulfillers.query.byOpp(sources))

  return {
    oppKey$,
    memberships$,
    fulfillers$,
  }
}

const Next = sources => ListItemNavigating({...sources,
  title$: just('That\'s enough, carry on!'),
  subtitle$:
    just('You can choose as many teams as you want, but you only need one.'),
  leftDOM$: just(icon('chevron-circle-right', 'accent')),
  path$:
    sources.engagementKey$.map(k => '/engaged/' + k + '/application'),
})

// const combineToDiv = (...DOMs) => combineLatest(
//   ...DOMs, (...doms) => div({},doms)
// )

export default sources => {
  const _sources = {...sources, ...Fetch(sources)}

  const inst = Instruct(_sources)
  const list = TeamsMembersList(_sources)
  const next = Next(_sources)

  const items = [
    inst,
    next,
    list,
  ]

  const DOM = combineLatest(
    _sources.memberships$.map(m => m.length > 0),
    ...items.map(i => i.DOM),
    (hasTeams, i, n, l) => div({},[
      hasTeams ? n : i,
      l,
    ])
  )

  return {
    DOM,
    queue$: list.queue$,
    route$: next.route$,
  }
}
