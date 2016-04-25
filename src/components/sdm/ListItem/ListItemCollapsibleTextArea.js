import {Observable as $} from 'rx'

import {div} from 'cycle-snabbdom'

import {ListItemCollapsible} from './ListItemCollapsible'

import {TextAreaControl} from 'components/sdm'
import {OkAndCancel} from 'components/sdm'

export const ListItemCollapsibleTextArea = sources => {
  const ta = TextAreaControl(sources)
  const oac = OkAndCancel(sources)

  const value$ = ta.value$.sample($.merge(oac.ok$, ta.enter$))

  const li = ListItemCollapsible({...sources,
    contentDOM$: $.combineLatest(ta.DOM, oac.DOM, (...doms) => div({},doms)),
    subtitle$: sources.value$.combineLatest(
      sources.subtitle$ || $.just(null),
      (v,st) => v || st
    ).merge(value$),
    isOpen$: $.merge(
      sources.isOpen$ || $.never(),
      ta.enter$.map(false),
      oac.ok$.map(false),
      oac.cancel$.map(false)
    ).share(),
  })

  return {
    DOM: li.DOM,
    ok$: oac.ok$,
    value$,
  }
}
