import ProfileDisplay from 'ferly/components/ProfileDisplay'
import PropTypes from 'prop-types'
import React from 'react'
import {apiRequire} from 'ferly/store/api'
import {connect} from 'react-redux'
import {createUrl} from 'ferly/utils/fetch'
import {View, TextInput, TouchableOpacity, StyleSheet} from 'react-native'

class Search extends React.Component {
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
    const design = this.props.navigation.state.params
    const {navigation, users} = this.props

    if (text.length > 1) {
      return (
        <View>
          {
            users.map((user) => {
              if (user.title.toLowerCase().startsWith(text.toLowerCase())) {
                return (
                  <TouchableOpacity
                    key={user.id}
                    onPress={
                      () => navigation.navigate('Amount', {user, design})}>
                    <ProfileDisplay name={user.title} url={user.picture} />
                  </TouchableOpacity>
                )
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
          style={styles.searchInput}
          onChangeText={(t) => this.setState({text: t})}
          placeholder="Search" />
        <View style={{paddingHorizontal: 20}}>
          {this.renderResults()}
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  searchInput: {
    paddingLeft: 30,
    fontSize: 22,
    maxHeight: 70,
    flex: 1,
    borderWidth: 9,
    borderColor: '#E4E4E4'
  }
})

Search.propTypes = {
  apiRequire: PropTypes.func.isRequired,
  users: PropTypes.array.isRequired,
  usersUrl: PropTypes.string.isRequired,
  navigation: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  const usersUrl = createUrl('users')
  const apiStore = state.apiStore
  const users = apiStore[usersUrl] || []

  return {
    usersUrl,
    users
  }
}

const mapDispatchToProps = {
  apiRequire
}

export default connect(mapStateToProps, mapDispatchToProps)(Search)
