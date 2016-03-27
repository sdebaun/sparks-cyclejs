import {Observable} from 'rx'
const {just} = Observable

import {
  ListItem,
  ListWithHeader,
  ListItemNavigating,
} from 'components/sdm'

const OppItemNavigating = sources => ListItemNavigating({...sources,
  title$: sources.item$.pluck('name'),
  path$: sources.path$ || sources.item$.map(({$key}) => '/opp/' + $key),
})

const Header = () => ListItem({
  classes$: just({header: true}),
  title$: just('opps'),
})

const OppListNavigating = sources => ListWithHeader({...sources,
  headerDOM: Header(sources).DOM,
  Control$: just(OppItemNavigating),
})

export {OppItemNavigating, OppListNavigating}
