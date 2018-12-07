import Icon from 'react-native-vector-icons/FontAwesome'
import PropTypes from 'prop-types'
import React from 'react'
import {apiExpire} from 'ferly/store/api'
import {connect} from 'react-redux'
import {createUrl, post} from 'ferly/utils/fetch'
import {StackActions} from 'react-navigation'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image
} from 'react-native'

export class Contact extends React.Component {
  static navigationOptions = {
    title: 'Select Method'
  };

  submit (option) {
    post('invite', {recipient: option})
      .then((response) => response.json())
      .then((json) => {
        if (Object.keys(json).length > 0) {
          Alert.alert('Error', `Unable to send to ${option}`)
          return
        }
        this.props.apiExpire(
          createUrl('existing-invitations', {status: 'pending'}))
        const resetAction = StackActions.reset({
          index: 0,
          actions: [StackActions.push({routeName: 'Invitations'})]
        })
        this.props.navigation.dispatch(resetAction)
        Alert.alert('Invite Sent!', `You sent an invite to ${option}.`)
      })
  }

  confirm (option) {
    Alert.alert(
      'Confirm',
      `Are you sure you'd like to send an invitation to ${option}.`,
      [
        {text: 'No', onPress: null},
        {text: 'Yes', onPress: () => this.submit(option)}
      ]
    )
  }

  renderOption (option) {
    return (
      <TouchableOpacity
        key={option}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 32,
          paddingLeft: 20
        }}
        onPress={() => this.confirm(option)}>
        <Icon
          name={option.indexOf('@') > -1 ? 'envelope' : 'phone'}
          color='black'
          size={26} />
        <Text style={{fontSize: 22, paddingLeft: 20}}>{option}</Text>
      </TouchableOpacity>
    )
  }

  render () {
    const contact = this.props.navigation.state.params
    const options = contact.phones.concat(contact.emails)
    const {display} = contact

    let image
    if (display.uri) {
      image = (
        <Image
          source={{uri: display.uri}}
          style={{borderRadius: 50, height: 100, width: 100}}/>)
    } else {
      image = (
        <View style={{
          height: 100,
          width: 100,
          borderRadius: 50,
          backgroundColor: 'lightgray',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Text style={{fontSize: 32}}>{display.initials}</Text>
        </View>
      )
    }
    return (
      <ScrollView contentContainerStyle={{flex: 1}}>
        <View
          style={{
            paddingTop: 40,
            paddingBottom: 20,
            flexDirection: 'row',
            justifyContent: 'center'}}>
          <View style={{alignItems: 'center'}}>
            {image}
            <Text style={{fontSize: 26, paddingTop: 10}}>{contact.name}</Text>
          </View>
        </View>
        {options.map((option) => this.renderOption(option))}
      </ScrollView>
    )
  }
}

Contact.propTypes = {
  apiExpire: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {}
}

const mapDispatchToProps = {
  apiExpire
}

export default connect(mapStateToProps, mapDispatchToProps)(Contact)
