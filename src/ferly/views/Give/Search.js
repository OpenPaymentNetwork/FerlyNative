import ProfileDisplay from 'ferly/components/ProfileDisplay'
import PropTypes from 'prop-types'
import React from 'react'
import {apiRequire} from 'ferly/store/api'
import {connect} from 'react-redux'
import {createUrl} from 'ferly/utils/fetch'
import {
  View,
  ScrollView,
  TouchableOpacity
  // StyleSheet
} from 'react-native'

class Search extends React.Component {
  static navigationOptions = {
    title: 'Recipient'
  }

  componentDidMount () {
    this.props.apiRequire(this.props.usersUrl)
  }

  renderResults () {
    const design = this.props.navigation.state.params
    const {navigation, users} = this.props
    return (
      <ScrollView>
        {
          users.map((user) => {
            return (
              <TouchableOpacity
                key={user.id}
                onPress={
                  () => navigation.navigate('Amount', {user, design})}>
                <ProfileDisplay name={user.title} url={user.picture} />
              </TouchableOpacity>
            )
          })
        }
      </ScrollView>
    )
  }

  render () {
    //        <TextInput
    //         style={styles.searchInput}
    //          onChangeText={(t) => this.setState({text: t})}
    //          placeholder="Search" />
    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <View style={{paddingHorizontal: 10}}>
          {this.renderResults()}
        </View>
      </View>
    )
  }
}

// const styles = StyleSheet.create({
//   searchInput: {
//     paddingLeft: 30,
//     fontSize: 22,
//     maxHeight: 70,
//     flex: 1,
//     borderWidth: 9,
//     borderColor: '#E4E4E4'
//   }
// })

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
