import Avatar from 'ferly/components/Avatar'
import PropTypes from 'prop-types'
import React from 'react'
import SearchBar from 'ferly/components/SearchBar'
import Spinner from 'ferly/components/Spinner'
import Theme from 'ferly/utils/theme'
import {apiRequire} from 'ferly/store/api'
import {connect} from 'react-redux'
import {createUrl} from 'ferly/utils/fetch'
import {ScrollView, Text, TouchableOpacity, View} from 'react-native'

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

  renderUsers (users) {
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
                  <Avatar
                    size={68}
                    pictureUrl={user.picture}
                    firstWord={firstName}
                    secondWord={lastName} />
                  <View style={{justifyContent: 'center', marginLeft: 10}}>
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
    const {searchResults, searchText} = this.state
    let body
    if (searchResults) {
      if (searchResults.length === 0) {
        body = (
          <Text>
            {
              'We\'re sorry, we couldn\'t find anyone matching \'' +
              searchText + '\'. Use invitations in the menu to invite ' +
              'someone to Ferly.'
            }
          </Text>
        )
      } else {
        body = this.renderUsers(searchResults)
      }
    } else {
      let display = <Spinner />
      if (recents) {
        if (recents.length === 0) {
          display = (
            <Text>
              {
                'First time sending a gift? Search for family and friends ' +
                'above. Use invitations in the menu to invite someone you ' +
                'can\'t find.'
              }
            </Text>
          )
        } else {
          display = this.renderUsers(recents)
        }
      }
      body = (
        <View style={{flex: 1}}>
          <Text style={{fontSize: 18, color: Theme.lightBlue}}>
            Most Recent Recipients
          </Text>
          {display}
        </View>
      )
    }

    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <SearchBar
          placeholder='Search for family and friends'
          onChangeText={this.onChangeText.bind(this)} />
        <View style={{flex: 1, marginHorizontal: 10}}>
          {body}
        </View>
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
  const {recents} = apiStore[walletUrl] || {}

  return {
    walletUrl,
    recents
  }
}

const mapDispatchToProps = {
  apiRequire
}

export default connect(mapStateToProps, mapDispatchToProps)(Recipient)
