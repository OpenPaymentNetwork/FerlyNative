import ProfileDisplay from '../components/ProfileDisplay'
import PropTypes from 'prop-types'
import React from 'react'
import {apiRequire} from '../store/api'
import {connect} from 'react-redux'
import {createUrl} from '../utils/fetch'
import {View, TextInput} from 'react-native'

class GiveScreen extends React.Component {
  static navigationOptions = {
    title: 'Give',
    drawerLabel: 'Give Gift'
  };

  constructor (props) {
    super(props)
    this.state = {text: ''}
  }

  componentDidMount () {
    this.props.apiRequire(this.props.usersUrl)
  }

  renderResults () {
    const text = this.state.text || ''
    if (text.length > 1) {
      return (
        <View>
          {
            this.props.users.map((user) => {
              if (user.title.toLowerCase().startsWith(text.toLowerCase())) {
                return <ProfileDisplay key={user.title} name={user.title} url={user.picture} />
              } else {
                return null
              }
            })
          }
        </View>
      )
    }
  }

  render () {
    return (
      <View style={{flex: 1}}>
        <TextInput
          style={{
            paddingLeft: 30,
            fontSize: 22,
            maxHeight: 70,
            flex: 1,
            borderWidth: 9,
            borderColor: '#E4E4E4'}}
          onChangeText={(t) => this.setState({text: t})}
          placeholder="Search" />
        <View style={{paddingHorizontal: 20}}>
          {this.renderResults()}
        </View>
      </View>
    )
  }
}

GiveScreen.propTypes = {
  apiRequire: PropTypes.func.isRequired,
  users: PropTypes.array.isRequired,
  usersUrl: PropTypes.string.isRequired,
  navigation: PropTypes.object.isRequired
}

function map (state) {
  const usersUrl = createUrl('users')
  const apiStore = state.apiStore
  const users = apiStore[usersUrl] || []

  return {
    usersUrl,
    users
  }
}

const dispatch = {
  apiRequire
}

export default connect(map, dispatch)(GiveScreen)
