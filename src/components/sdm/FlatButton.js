//placeholder for replacement w cyclic-surface-material
import {Observable} from 'rx'
const {just} = Observable

import combineLatestObj from 'rx-combine-latest-obj'
import {Button} from 'snabbdom-material'

import newId from './id'

const FlatButton = sources => {
  const id = newId()

  const viewState = {
    label$: sources.label$ || just('Button'),
    classNames$: sources.classNames$ || just([]),
  }

  const click$ = sources.DOM.select('.' + id).events('click')

  const DOM = combineLatestObj(viewState)
    .map(({label, classNames}) =>
      Button({
        onClick: true,
        flat: true,
        className: [id, ...classNames].join('.'),
      }, [
        label,
      ]),
    )

  return {
    DOM,
    click$,
  }
}

export {FlatButton}
