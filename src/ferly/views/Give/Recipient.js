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
      searchResults: null,
      searchText: ''
    }
  }

  componentDidMount () {
    this.props.apiRequire(this.props.walletUrl)
  }

  onChangeText (text) {
    const query = text[0] === '@' ? text.slice(1) : text
    if (query === '') {
      this.setState({searchResults: null})
    } else {
      fetch(createUrl('search-users', {query: query}))
        .then((response) => response.json())
        .then((json) => {
          if (this.state.searchText === text) { // The user is done typing.
            this.setState({searchResults: json.results})
          }
        })
    }
    this.setState({searchText: text})
  }

  listUsers (users) {
    const {navigation} = this.props
    const design = navigation.state.params

    return (
      <ScrollView style={{flex: 1}}>
        {
          users.map((user) => {
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
  }

  render () {
    const {recents} = this.props
    const {searchResults} = this.state
    let body
    if (searchResults) {
      if (searchResults.length === 0) {
        body = <Text>No users match your search.</Text>
      } else {
        body = this.listUsers(searchResults)
      }
    } else if (recents.length > 0) {
      body = (
        <View style={{flex: 1}}>
          <View
            style={{
              marginHorizontal: 10,
              paddingLeft: 10,
              borderBottomWidth: 0.5,
              borderColor: 'darkgray'
            }}>
            <Text style={{fontSize: 20}}>Recent</Text>
          </View>
          {this.listUsers(recents)}
        </View>
      )
    }

    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <SearchBar
          placeholder='Search all users'
          onChangeText={this.onChangeText.bind(this)} />
        {body}
      </View>
    )
  }
}

Recipient.propTypes = {
  apiRequire: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  recents: PropTypes.array,
  walletUrl: PropTypes.string.isRequired
}

function mapStateToProps (state) {
  const apiStore = state.api.apiStore
  const walletUrl = createUrl('wallet')
  const recents = apiStore[walletUrl].recents || []

  return {
    walletUrl,
    recents
  }
}

const mapDispatchToProps = {
  apiRequire
}

export default connect(mapStateToProps, mapDispatchToProps)(Recipient)
