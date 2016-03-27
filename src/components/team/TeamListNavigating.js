import {Observable} from 'rx'
const {just} = Observable

import {
  ListItem,
  ListWithHeader,
} from 'components/sdm'

import {TeamItemNavigating} from './TeamItemNavigating'

const TeamHeader = () => ListItem({
  classes$: just({header: true}),
  title$: just('teams'),
})

const TeamListNavigating = sources => ListWithHeader({...sources,
  headerDOM: TeamHeader(sources).DOM,
  Control$: just(TeamItemNavigating),
})

export {TeamListNavigating}
