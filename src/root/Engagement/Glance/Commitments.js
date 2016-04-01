import {Observable} from 'rx'
const {just, merge, combineLatest} = Observable

import isolate from '@cycle/isolate'

import {div, icon} from 'helpers'

import {
  ListItemNavigating,
} from 'components/sdm'

import {
  TitleListItem,
  QuotingListItem,
} from 'components/ui'

// import {log} from 'util'

import {
  ListItemHeader,
  ListWithHeader,
} from 'components/sdm'

import {CommitmentItemPassive} from 'components/commitment'

const CommitmentList = sources => ListWithHeader({...sources,
  headerDOM: ListItemHeader(sources).DOM,
  Control$: just(CommitmentItemPassive),
})

export default sources => {
  const commitments$ = sources.commitments$

  const title = TitleListItem({...sources,
    title$: just('This is your Energy Exchange.'),
  })

  const info = QuotingListItem({...sources,
    title$: sources.opp$.pluck('description'),
    profileKey$: sources.project$.pluck('ownerProfileKey'),
  })

  const gives = CommitmentList({...sources,
    title$: just('you GIVE'),
    rows$: commitments$.map(cs => cs.filter(({party}) => party === 'vol')),
  })

  const gets = CommitmentList({...sources,
    title$: just('you GET'),
    rows$: commitments$.map(cs => cs.filter(({party}) => party === 'org')),
  })

  const items = [title, info, gives, gets]
  // const route$ = merge(...todos.map(t => t.route$))

  const DOM = combineLatest(
    items.map(i => i.DOM),
    (...doms) => div({}, doms)
  )

  return {
    DOM,
    // route$,
  }
}
