import {Observable} from 'rx'
import {a, img} from 'cycle-snabbdom'

// TODO: implement
export default (sources) => ({
  DOM: Observable.just(
    a({props: {href: '/'}}, [
      img({
        style: {height: '24px', float: 'left'},
        attrs: {src: '/images/sn-logo-32.png'},
      }),
    ])
  ),
})
