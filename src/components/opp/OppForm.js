import {Observable} from 'rx'
const {just} = Observable

import combineLatestObj from 'rx-combine-latest-obj'
import {col} from 'helpers'

import {InputControl} from 'components/sdm'
import {Form} from 'components/ui/Form'

const NameInput = sources =>
  InputControl({label$: just('Name the Opportunity'), ...sources})

const OppForm = sources => Form({
  ...sources,
  Controls$: just([{field: 'name', Control: NameInput}]),
})

const OldOppForm = sources => {
  const nameInput = NameInput(sources)

  const opp$ = combineLatestObj({
    name$: nameInput.value$,
  })

  const viewState = {
    nameInputDOM$: nameInput.DOM,
  }

  const DOM = combineLatestObj(viewState)
    .map(({nameInputDOM}) => col(nameInputDOM))

  return {
    DOM,
    opp$,
  }
}

export {OppForm}
