import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import {div,h} from 'cycle-snabbdom'
import {Col, Row} from 'snabbdom-material'

import {icon} from 'helpers'

const ListItem = (props,children) =>
  h('div.row', {style: {'line-height': '48px'}, ...props},[
  // Row({style: {'line-height': '48px'}, ...props},[
    Col({type: 'xs-1', style: {width: '48px', 'font-size': '32px'}},[children[0]]),
    Col({type: 'xs-8'},[children[1]]),
  ])

const _DOM = ({project}) =>
  div({}, [
    ListItem(
      {attrs: {link: '/project/' + project.$key + '/manage'}},
      [icon('playlist_add','black'),'What\'s your Project all about?']
    ),
    ListItem(
      {attrs: {link: '/project/' + project.$key + '/manage'}},
      [icon('group_add','black'),'Build Your First Team']
    ),
    ListItem(
      {attrs: {link: '/project/' + project.$key + '/manage'}},
      [icon('power','black'),'Create a Volunteer Opportunity']
    ),
    ListItem(
      {attrs: {'data-link': '/project/' + project.$key + '/staff'}},
      [icon('person_add','black'),'Invite More Admins to Help']
    ),
  ])

export default sources => {
  const DOM = combineLatestObj({
    project$: sources.project$,
  }).map(_DOM)

  return {
    DOM,
  }
}
