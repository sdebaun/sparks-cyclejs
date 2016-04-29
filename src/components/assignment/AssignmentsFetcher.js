import {Observable as $} from 'rx'

import {
  Assignments,
} from 'components/remote'

export const AssignmentsFetcher = sources => ({
  assignments$: sources.profileKey$
    .flatMapLatest(k => k ?
        Assignments.query.byProfile(sources)(k) :
        $.just(null)
      ),
})
