import Icon from 'react-native-vector-icons/FontAwesome'
import PrimaryButton from 'ferly/components/PrimaryButton'
import PropTypes from 'prop-types'
import React from 'react'
import Spinner from 'ferly/components/Spinner'
import Theme from 'ferly/utils/theme'
import {apiRequire, apiExpire} from 'ferly/store/api'
import {connect} from 'react-redux'
import {createUrl, post} from 'ferly/utils/fetch'
import {StackActions} from 'react-navigation'
import {View, Text, Image, StyleSheet, TouchableOpacity, TextInput} from 'react-native'

class Profile extends React.Component {
  static navigationOptions = {
    title: 'Profile'
  };

  constructor (props) {
    super(props)
    this.state = {
      editing: false,
      submitting: false,
      form: {firstName: '', lastName: '', username: ''},
      invalid: {}
    }
  }

  componentDidMount () {
    this.props.apiRequire(this.props.walletUrl)
  }

  renderAvatar () {
    const {firstName, lastName, profileImage} = this.props

    if (profileImage) {
      return (
        <Image style={styles.avatarContainer} source={{uri: profileImage}} />)
    } else {
      return (
        <View style={[styles.avatarContainer, styles.profileText]}>
          <Text style={{fontSize: 34, color: 'gray'}}>
            {firstName.charAt(0) + lastName.charAt(0)}
          </Text>
        </View>
      )
    }
  }

  formSubmit () {
    const form = this.state.form || {}
    const {apiExpire, navigation} = this.props
    this.setState({submitting: true})

    const postParams = {
      first_name: form.firstName,
      last_name: form.lastName,
      username: form.username
    }

    post('edit-profile', postParams)
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({submitting: false})
        if (this.validateResponse(responseJson)) {
          apiExpire(createUrl('wallet'))
          const resetAction = StackActions.reset({
            index: 0,
            actions: [StackActions.push({routeName: 'Profile'})]
          })
          navigation.dispatch(resetAction)
        }
      })
  }

  validateResponse (responseJson) {
    if (responseJson.invalid) {
      this.setState({
        invalid: responseJson.invalid
      })
      return false
    } else if (responseJson.error === 'existing_username') {
      this.setState({invalid: {username: 'Username already taken'}})
      return false
    } else {
      return true
    }
  }

  invalidUsernameMessage (username) {
    let msg
    if (username.length < 4 || username.length > 20) {
      msg = 'Must be 4-20 characters long.'
    } else if (!username.charAt(0).match('^[a-zA-Z]$')) {
      msg = 'Must start with a letter.'
    } else if (!username.match('^[0-9a-zA-Z.]+$')) {
      msg = 'Must contain only letters, numbers, and periods.'
    }
    return msg
  }

  validateUsername (username) {
    let msg = this.invalidUsernameMessage(username)
    if (msg) {
      this.setState({form: {username: username}, invalid: {username: msg}})
    } else {
      const newInvalid = Object.assign({}, this.state.invalid)
      delete newInvalid.username
      this.setState({invalid: newInvalid})
    }
  }

  renderPage () {
    const {firstName, lastName, username} = this.props
    const {editing, submitting, invalid} = this.state

    if (!editing) {
      return (
        <View>
          <Text style={styles.name}>{firstName + ' ' + lastName}</Text>
          <Text style={styles.username}>{'@' + username}</Text>
        </View>
      )
    } else {
      const form = this.state.form || {}
      const formFirstName = form.firstName
      const formLastName = form.lastName
      const formUsername = form.username

      const changed = (
        firstName !== formFirstName ||
        lastName !== formLastName ||
        username !== formUsername)

      return (
        <View style={{flex: 1, justifyContent: 'space-between', width: '100%'}}>
          <View style={{paddingHorizontal: 40, paddingVertical: 20}}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.field}
              underlineColorAndroid={'transparent'}
              onChangeText={(text) => this.setState({form: Object.assign(form, {firstName: text})})}
              value={formFirstName} />
            {
              invalid.first_name
                ? (<Text style={styles.error}>{invalid.first_name}</Text>)
                : null
            }
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.field}
              underlineColorAndroid={'transparent'}
              onChangeText={(text) => this.setState({form: Object.assign(form, {lastName: text})})}
              value={formLastName} />
            {
              invalid.last_name
                ? (<Text style={styles.error}>{invalid.last_name}</Text>)
                : null
            }
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.field}
              underlineColorAndroid={'transparent'}
              onChangeText={(text) => {
                this.validateUsername(text)
                this.setState({form: Object.assign(form, {username: text})})
              }}
              value={formUsername} />
            {
              invalid.username
                ? (<Text style={styles.error}>{invalid.username}</Text>)
                : null
            }
          </View>
          <PrimaryButton
            title="Save"
            disabled={
              !changed ||
              submitting ||
              !!invalid.username
            }
            color={Theme.lightBlue}
            onPress={() => this.formSubmit()} />
        </View>
      )
    }
  }

  toggleEdit () {
    const {editing} = this.state
    const {firstName, lastName, username} = this.props
    const refreshedFormState = {
      firstName: firstName,
      lastName: lastName,
      username: username
    }
    this.setState({editing: !editing, form: refreshedFormState, invalid: {}})
  }

  render () {
    const {editing} = this.state
    const {firstName} = this.props

    if (!firstName) {
      return <Spinner />
    }

    return (
      <View style={{flex: 1, backgroundColor: 'white', alignItems: 'center', paddingTop: 20}}>
        <TouchableOpacity
          style={{alignSelf: 'flex-end', position: 'absolute', padding: 20}}
          onPress={() => this.toggleEdit()}>
          <Icon
            name={editing ? 'times' : 'pencil'}
            color={Theme.lightBlue}
            size={24} />
        </TouchableOpacity>
        {this.renderAvatar()}
        {this.renderPage()}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60
  },
  label: {
    color: 'gray',
    marginTop: 14
  },
  profileText: {
    backgroundColor: 'lightgray',
    justifyContent: 'center',
    alignItems: 'center'
  },
  error: {color: 'red', width: '100%'},
  topView: {
    flex: 1,
    justifyContent: 'space-around',
    backgroundColor: Theme.darkBlue,
    alignItems: 'center'
  },
  name: {fontSize: 30},
  username: {fontSize: 20, color: 'lightgray'},
  field: {
    borderBottomWidth: 1,
    borderColor: 'gray',
    fontSize: 18,
    width: '100%'
  }
})

Profile.propTypes = {
  apiExpire: PropTypes.func.isRequired,
  apiRequire: PropTypes.func.isRequired,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  navigation: PropTypes.object.isRequired,
  profileImage: PropTypes.string,
  username: PropTypes.string,
  walletUrl: PropTypes.string.isRequired
}

function mapStateToProps (state) {
  const walletUrl = createUrl('wallet')
  const apiStore = state.apiStore
  const myWallet = apiStore[walletUrl] || {}
  const {amounts, username, profileImage} = myWallet
  const firstName = myWallet.first_name
  const lastName = myWallet.last_name

  return {
    walletUrl,
    amounts,
    firstName,
    lastName,
    username,
    profileImage
  }
}

const mapDispatchToProps = {
  apiExpire,
  apiRequire
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile)
