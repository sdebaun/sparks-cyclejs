import {Observable as $} from 'rx'

import {hideable} from 'util'

import {
  TitledCard,
} from 'components/sdm'

import {
  ToDoListItem,
} from 'components/ui'

const ToDoShifts = sources => ToDoListItem({...sources,
  title$: $.of('Choose when you\'d like to work.'),
  isDone$: sources.engagement$.map(m => !!m.isAssigned),
  path$: $.of(sources.router.createHref('/confirmation')),
})

const ToDoPayment = sources => ToDoListItem({...sources,
  title$: $.of('Make your payments.'),
  isDone$: sources.engagement$.map(m => !!m.isPaid),
  path$: $.of(sources.router.createHref('/confirmation')),
})

const CNCard = sources => {
  const sh = ToDoShifts(sources)
  const pmt = ToDoPayment(sources)

  const card = TitledCard({...sources,
    title$: $.just('Lock in Your Spot'),
    content$: $.combineLatest(sh.DOM, pmt.DOM),
  })

  const route$ = $.merge(
    sh.route$,
    pmt.route$
      .withLatestFrom(sources.engagements$ || $.just({isAccepted: false}),
        (route, eng) => eng.isAccepted ? route : false
      ).filter(Boolean)
  )

  return {
    DOM: card.DOM,
    route$,
  }
}

export const CardConfirmNow = sources => hideable(CNCard)({...sources,
  elevation$: $.just(2),
  isVisible$: sources.engagement$
    .map(e => e.isAccepted && !e.isConfirmed && !e.isPaid),
  title$: $.just('Confirm Now!'),
})
