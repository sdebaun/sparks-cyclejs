import {Observable as $} from 'rx'
// const {just, merge, combineLatest} = Observable

// import {log} from 'util'

import {combineDOMsToDiv} from 'util'
import {icon} from 'helpers'

import {
  TitleListItem,
} from 'components/ui'

import {
  LargeCard,
  ListItemNavigating,
} from 'components/sdm'

import Step1 from './Step1'
import Step2 from './Step2'

const _Title = sources => TitleListItem({...sources,
  title$: sources.isConfirmed$.map(isConfirmed =>
    isConfirmed ? 'You Are Confirmed' : 'Confirm Your Spot'
  ),
})

const _AllDone = sources => ListItemNavigating({...sources,
  title$: $.just('You\'re confirmed!'),
  subtitle$: $.just('We will send you a message when the event is coming up.'),
  leftDOM$: $.of(icon('chevron-circle-right', 'accent')),
  path$: sources.engagementKey$.map(k => `/engaged/${k}`),
  isVisible$: sources.isConfirmed$,
})

export default sources => {
  const t = _Title(sources)
  const s1 = Step1(sources)
  const s2 = Step2(sources)
  const ad = _AllDone(sources)

  const card = LargeCard({...sources,
    content$: $.combineLatest(t.DOM, s1.DOM, s2.DOM, ad.DOM),
  })

  const queue$ = $.merge(s1.queue$, s2.queue$)
  queue$.subscribe(x => console.log('new queue task:', x))

  return {
    DOM: combineDOMsToDiv('.cardcontainer', card),
    queue$,
    route$: ad.route$,
  }
}
