import {Observable} from 'rx'
const {just, combineLatest} = Observable

import isolate from '@cycle/isolate'
import combineLatestObj from 'rx-combine-latest-obj'
import {div, col, icon, iconSrc} from 'helpers'
import listItem from 'helpers/listItem'

import {
  List,
  ListItem,
  ListItemNavigating,
  ListItemClickable,
  ListItemCollapsibleTextArea,
} from 'components/sdm'

import {Opps, Fulfillers} from 'remote'

import {
  TeamImages,
} from 'components/remote'

// import {rows} from 'util'
import {log} from 'util'

// const _toggleActions = sources => Observable.merge(
//   sources.DOM.select('.fulfiller').events('click')
//     .map(e => e.ownerTarget.dataset.key),
// )

// const _renderTeams = (teamRows, fulfilledLookup) =>
//   teamRows.length === 0 ? ['Add a team'] : [
//     listItem({title: 'allowed teams', header: true}),
//     listItem({
//       title: 'What teams can applicants pick from?',
//       subtitle:
//         `Volunteers can fulfill their commitments
//         with shifts from the teams you select.`,
//     }),
//     ...teamRows.map(t => listItem({
//       title: t.name,
//       className: 'fulfiller',
//       key: t.$key,
//       iconName:
//         fulfilledLookup[t.$key] ? 'check_box' : 'check_box_outline_blank',
//     })),
//   ]

// const _render = ({teams, fulfilledLookup, textareaQuestionDOM, listDOM}) =>
//   col(
//     textareaQuestionDOM,
//     listDOM,
//     // ..._renderTeams(rows(teams), fulfilledLookup)
//   )

const TextareaQuestion = sources => ListItemCollapsibleTextArea({
  ...sources,
  title$: just('You can ask people one special question when they apply.'),
  iconName$: just('playlist_add'),
  okLabel$: just('this sounds great'),
  cancelLabel$: just('hang on ill do this later'),
})

// const PreviewRecruiting = sources => ListItemNavigating({...sources,
//   title$: just('Preview your Recruiting page.'),
//   path$: combineLatest(
//     sources.projectKey$, sources.oppKey$,
//     (pk, ok) => '/apply/' + pk + '/opp/' + ok
//   ),
// })

const TeamIcon = sources => ({
  DOM: sources.key$
    .flatMapLatest(key => TeamImages.query.one(sources)(key))
    .map(i => i && i.dataUrl && iconSrc(i.dataUrl) || icon('power')),
})

const TeamFulfillerLookup = sources => ({
  fulfiller$: sources.fulfillers$.combineLatest(
    sources.key$,
    (fulfillers, key) =>
      fulfillers.find(({$key, teamKey}) => key === teamKey ? $key : false)
  ),
})

// const fulfillerByTeam$$ = (sources, key) =>
//   sources.fulfillers$.map(fulfillers =>
//     fulfillers.find(({$key, teamKey}) => key === teamKey ? $key : false)
//   )

const TeamFulfillerHeader = sources => ListItem({
  classes$: just({header: true}),
  title$: just('allowed teams'),
  rightDOM$: sources.fulfillers$.combineLatest(
    sources.rows$,
    (fulfillers, rows) => `${fulfillers.length}/${rows.length}`
  ),
})

const GetStartedItem = sources => ListItemNavigating({...sources,
  title$: just('Add a Team'),
  iconName$: just('group_add'),
  subtitle$: just('Once you have Teams, you\'ll be able to add them to this Opportunity.'),
})

const HelpItem = sources => ListItem({...sources,
  title$: just('What Teams can these Volunteers apply for?'),
})

const TeamFulfilledListItem = sources => {
  const key$ = sources.item$.pluck('$key')
  const fulfiller$ = TeamFulfillerLookup({...sources, key$}).fulfiller$

  const li = ListItemClickable({...sources,
    leftDOM$: TeamIcon({...sources,key$}).DOM,
    title$: sources.item$.pluck('name'),
    rightDOM$: fulfiller$.map(v => icon(v ? 'check_box' : 'check_box_outline_blank')),
  })

  li.click$.subscribe(log('click$'))
  fulfiller$.subscribe(log('fulfiller$'))

  const queue$ = fulfiller$
    .sample(li.click$)
    .combineLatest(
      key$,
      // sources.teamKey$,
      sources.oppKey$,
      (fulfiller, teamKey, oppKey) => fulfiller && fulfiller.$key ?
        Fulfillers.delete(fulfiller.$key) :
        Fulfillers.create({teamKey, oppKey}),
    )

  return {
    DOM: li.DOM,
    queue$,
  }
}

const TeamFulfilledList = sources => {
  const header = TeamFulfillerHeader(sources)
  const start = GetStartedItem(sources)
  const help = HelpItem(sources)

  const list = List({...sources,
    Control$: just(TeamFulfilledListItem),
  })

  const DOM = sources.rows$.combineLatest(
    start.DOM,
    header.DOM,
    help.DOM,
    list.DOM,
    (rows, startDOM, ...restDOM) =>
      div({}, rows.length > 0 ? restDOM : [startDOM]),
  )

  return {
    DOM,
    queue$: list.queue$,
  }
}

import {Fulfillers as _Fulfillers} from 'components/remote'

export default sources => {
  const fulfillers$ = sources.oppKey$
    .flatMapLatest(_Fulfillers.query.byOpp(sources))

  fulfillers$.subscribe(log('fulfillers$'))

  const flist = TeamFulfilledList({...sources,
    rows$: sources.teams$,
    fulfillers$: fulfillers$,
  })

  flist.queue$.subscribe(log('flist.queue$'))

  const fulfilledLookup$ = fulfillers$.map(fulfillers =>
    fulfillers.reduce((a, row) => (a[row.teamKey] = row.$key) && a, {})
  )
  fulfilledLookup$.subscribe(log('fulfilledLookup$'))

  const textareaQuestion = isolate(TextareaQuestion)({...sources,
    value$: sources.opp$.pluck('question'),
  })

  const updateQuestion$ = textareaQuestion.value$
    .withLatestFrom(sources.oppKey$, (question,key) =>
      Opps.update(key,{question})
    )

  const queue$ = Observable.merge(
    updateQuestion$,
    flist.queue$,
  )

  flist.DOM.subscribe(log('flistDOM'))

  sources.teams$.subscribe(log('teams$'))

  const DOM = combineLatest(
    textareaQuestion.DOM,
    flist.DOM,
    (...doms) => div({},doms),
  )

  return {
    DOM,
    queue$,
  }
}
