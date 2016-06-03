import {Observable as $} from 'rx'
import {not} from 'ramda'

const Login = provider => ({auth$}) => ({
  DOM: $.empty(),
  auth$: $.merge(
      auth$.isEmpty().filter(Boolean),
      auth$.filter(not)
    )
    .map({
      type: 'redirect',
      provider,
    }),
  route$: auth$
    .filter(a => a)
    .map('/dash'),
})

export default Login
