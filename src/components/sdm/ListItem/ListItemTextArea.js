import {Observable as $} from 'rx'

import {div} from 'cycle-snabbdom'

import {ListItem} from './ListItem'

import {TextAreaControl} from 'components/sdm'
import {OkAndCancel} from 'components/sdm'

export const ListItemTextArea = sources => {
  const ta = TextAreaControl(sources)
  const oac = OkAndCancel(sources)
  const li = ListItem({...sources,
    title$: $.combineLatest(ta.DOM, oac.DOM, (...doms) => div({},doms)),
  })

  return {
    DOM: li.DOM,
    value$: ta.value$.sample($.merge(oac.ok$, ta.enter$)),
  }
}

