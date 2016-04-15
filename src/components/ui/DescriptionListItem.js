import {Observable} from 'rx'
const {just, combineLatest} = Observable

import {span} from 'cycle-snabbdom'

import {
  ListItem,
} from 'components/sdm'

const DescriptionListItem = sources => ListItem({...sources,
  title$: combineLatest(
    sources.title$,
    sources.default$ || just('Empty'),
    (title,def) => title || span('.secondary',def)
  ),
  classes$: just({description: true}),
})

export {DescriptionListItem}
