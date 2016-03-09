import {div} from 'cycle-snabbdom'
import {Form,Input,Button} from 'snabbdom-material'

const projectForm = ({name}) =>
  Form({className: 'project'}, [
    Input({
      className: 'name',
      label: 'New Project Name',
      value: name,
    }),
    // need onClick: true or snabbdom-material renders as disabled :/
    name ? div({}, [
      Button({className: 'submit', onClick: true, primary: true},['Create']),
      Button(
        {className: 'cancel', onClick: true, secondary: true, flat: true},
        ['Cancel']
      ),
    ]) : null,
  ])

export {projectForm}
