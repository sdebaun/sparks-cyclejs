import {Observable} from 'rx'
const {just} = Observable

import combineLatestObj from 'rx-combine-latest-obj'
import {h} from 'cycle-snabbdom'

require('./scss/surface_styles.scss')

let _id = 0
const newId = () => _id += 1

const RaisedButton = sources => {
  const id = newId()

  const viewState = {
    label$: sources.label$ || just('Button'),
    classNames$: sources.classNames$ || just([]),
  }

  const click$ = sources.DOM.select('.id' + id).events('click')

  const DOM = combineLatestObj(viewState)
    .map(({label, classNames}) =>
      h(['button', 'btn--raised', 'id' + id, ...classNames].join('.'), [label])
    )

  return {
    DOM,
    click$,
  }
}

export {RaisedButton}
