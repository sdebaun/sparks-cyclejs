import {Observable} from 'rx'
import {TitleListItem} from 'components/ui'

export default name => sources => TitleListItem({...sources,
  title$: Observable.of('Coming Soon: ' + name),
})
