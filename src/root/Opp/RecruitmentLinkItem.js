import {Observable as $} from 'rx'

import {
  ListItemNewTarget,
} from 'components/sdm'

export const RecruitmentLinkItem = sources => ListItemNewTarget({...sources,
  title$: $.just('Check out your Recruiting page.'),
  iconName$: $.just('link'),
  url$: $.combineLatest(
    sources.projectKey$, sources.oppKey$,
    (pk, ok) => '/apply/' + pk + '/opp/' + ok
  ),
})
