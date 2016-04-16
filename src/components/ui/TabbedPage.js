import {RoutedComponent} from './RoutedComponent'
import {TabBar} from 'components/TabBar'
import {mergeSinks} from 'util'

export const TabbedPage = sources => {
  const routed = RoutedComponent(sources)
  const tbar = TabBar({...sources, tabs: sources.tabs$})

  return {
    DOM: routed.DOM,
    tabBarDOM: tbar.DOM,
    ...mergeSinks(routed, tbar),
  }
}

