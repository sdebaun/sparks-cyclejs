import {Observable} from 'rx'
const {just} = Observable

import {Form} from 'components/ui/Form'
import {InputControl} from 'components/sdm'

const NameInput = sources => InputControl({...sources,
  label$: just('Name the Opportunity'),
})

const OppForm = sources => Form({...sources,
  Controls$: just([{field: 'name', Control: NameInput}]),
})

export {OppForm}
