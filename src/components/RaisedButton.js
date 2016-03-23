//placeholder for replacement w cyclic-surface-material
import {Observable} from 'rx'
const {just} = Observable

import combineLatestObj from 'rx-combine-latest-obj'
import {Button} from 'snabbdom-material'

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
      Button({onClick: true, primary: true, className: classNames.join('.')}, [
        label,
      ]),
      // h(['button', 'btn--raised', 'id' + id, ...classNames].join('.'), [label])
    )

  return {
    DOM,
    click$,
  }
}



export {RaisedButton}
