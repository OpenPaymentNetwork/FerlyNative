import Avatar from 'ferly/components/Avatar'
import PropTypes from 'prop-types'
import React from 'react'
import SearchBar from 'ferly/components/SearchBar'
import {apiRequire} from 'ferly/store/api'
import {connect} from 'react-redux'
import {createUrl} from 'ferly/utils/fetch'
import {View, ScrollView, TouchableOpacity, Text} from 'react-native'

class Recipient extends React.Component {
  static navigationOptions = {
    title: 'Recipient'
  }

  constructor (props) {
    super(props)
    this.state = {
      searchResults: null
    }
  }

  componentDidMount () {
    this.props.apiRequire(this.props.usersUrl)
  }

  onSearch (results) {
    this.setState({searchResults: results})
  }

  render () {
    const {users, navigation} = this.props
    const design = navigation.state.params
    const {searchResults} = this.state
    const display = searchResults || users

    const results = (
      <ScrollView style={{flex: 1}}>
        {
          display.map((user) => {
            const firstName = user.first_name
            const lastName = user.last_name
            return (
              <TouchableOpacity
                key={user.id}
                onPress={
                  () => navigation.navigate('Amount', {user, design})}>
                <View marginVertical={10} style={{flexDirection: 'row'}}>
                  <View style={{marginHorizontal: 10}}>
                    <Avatar
                      size={68}
                      pictureUrl={user.picture}
                      firstWord={firstName}
                      secondWord={lastName} />
                  </View>
                  <View style={{justifyContent: 'center', flex: 1}}>
                    <Text style={{fontSize: 24}}>
                      {`${firstName} ${lastName}`}
                    </Text>
                    <Text style={{fontSize: 20, color: 'gray'}}>
                      {'@' + user.username}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )
          })
        }
      </ScrollView>
    )

    let body = results
    if (searchResults && searchResults.length === 0) {
      body = <Text>No users match your search.</Text>
    }

    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <SearchBar url='search-users' onSearch={this.onSearch.bind(this)} />
        {body}
      </View>
    )
  }
}

Recipient.propTypes = {
  apiRequire: PropTypes.func.isRequired,
  users: PropTypes.array.isRequired,
  usersUrl: PropTypes.string.isRequired,
  navigation: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  const usersUrl = createUrl('users')
  const apiStore = state.api.apiStore
  const users = apiStore[usersUrl] || []

  return {
    usersUrl,
    users
  }
}

const mapDispatchToProps = {
  apiRequire
}

export default connect(mapStateToProps, mapDispatchToProps)(Recipient)
