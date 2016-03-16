import {Observable} from 'rx'
import isolate from '@cycle/isolate'
import combineLatestObj from 'rx-combine-latest-obj'
import {col} from 'helpers'
import listItem from 'helpers/listItem'

import makeTextareaListItem from 'components/TextareaListItemFactory'

import {Opps} from 'remote'

import {rows} from 'util'
import {log} from 'util'

const _toggleActions = sources => Observable.merge(
  sources.DOM.select('.fulfiller').events('click')
    .map(e => e.ownerTarget.dataset.key),
)

const _renderTeams = teamRows =>
  teamRows.length === 0 ? ['Add a team'] : [
    listItem({title: 'allowed teams', header: true}),
    listItem({
      title: 'What teams can applicants pick from?',
      subtitle:
        `Volunteers can fulfill their commitments
        with shifts from the teams you select.`,
    }),
    ...teamRows.map(t => listItem({
      title: t.name,
      className: 'fulfiller',
      key: t.$key,
      iconName: 'check_box_outline_blank',
    })),
  ]

const _render = ({teams, textareaQuestionDOM}) =>
  col(
    textareaQuestionDOM,
    ..._renderTeams(rows(teams))
  )

const TextareaQuestion = makeTextareaListItem({
  iconName: 'playlist_add',
  title: 'You can ask people one special question when they apply.',
})

export default sources => {
  const textareaQuestion = isolate(TextareaQuestion)({
    value$: sources.opp$.pluck('question'),
    ...sources,
  })

  const updateQuestion$ = textareaQuestion.value$
    .withLatestFrom(sources.oppKey$, (question,key) =>
      Opps.update(key,{question})
    )

  const clickedTeamKeys$ = _toggleActions(sources)

  clickedTeamKeys$.subscribe(log('teamKey$'))

  const queue$ = Observable.merge(
    updateQuestion$,
  )

  const viewState = {
    textareaQuestionDOM: textareaQuestion.DOM,
    teams$: sources.teams$,
  }

  sources.teams$.subscribe(log('teams$'))

  const DOM = combineLatestObj(viewState).map(_render)
  return {
    DOM,
    queue$,
  }
}
