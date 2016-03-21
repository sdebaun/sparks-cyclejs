import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

// import isolate from '@cycle/isolate'

import {Opps} from 'remote'

import OppForm from 'components/OppForm'
import {makeModal} from 'components/ui'

import {col} from 'helpers'
import listItem from 'helpers/listItem'

// import {log} from 'util'

const _openActions$ = ({DOM}) => Observable.merge(
  DOM.select('.open').events('click').map(true),
  DOM.select('.close').events('click').map(false),
)

const _render = ({modalDOM}) =>
  col(
    listItem({
      iconName: 'power',
      iconBackgroundColor: 'yellow',
      title: 'Create an Opportunity to get volunteers.',
      className: 'open',
      clickable: true,
    }),
    modalDOM,
  )

const OppModal = makeModal({
  title: 'Create an Opportunity',
  iconName: 'power',
  submitLabel: 'But of Course',
  closeLabel: 'Not the Now',
})

export default sources => {
  const isOpen$ = _openActions$(sources)
    .startWith(false)

  const oppForm = OppForm(sources)

  const oppModal = OppModal({
    ...sources,
    contentDOM$: oppForm.DOM,
    isOpen$,
  })

  const queue$ = oppForm.opp$
    .sample(oppModal.submit$)
    .zip(sources.projectKey$,
      (opp,projectKey) => ({projectKey, ...opp})
    )
    .map(Opps.create)

  const viewState = {
    isOpen$,
    project$: sources.project$,
    modalDOM$: oppModal.DOM,
  }

  const DOM = combineLatestObj(viewState).map(_render)

  return {DOM, queue$}
}
