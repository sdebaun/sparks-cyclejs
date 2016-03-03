import {Observable} from 'rx'
import {a, img} from 'cycle-snabbdom'

export default (sources) => ({
  DOM: Observable.just(
    a({props: {href: '/'}}, [
      img({
        style: {height: '24px', float: 'left', marginLeft: '1em'},
        attrs: {src: '/images/sn-logo-32.png'},
      }),
    ])
  ),
})
