import PropTypes from 'prop-types'
import React from 'react'
import Spinner from 'ferly/components/Spinner'
import {Permissions, Contacts as expoContacts} from 'expo'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image
} from 'react-native'

export default class Contacts extends React.Component {
  static navigationOptions = {
    title: 'Select Recipient'
  };

  constructor (props) {
    super(props)
    this.state = {
      contacts: [],
      permission: undefined
    }
  }

  componentDidMount () {
    this.askContactPermissions()
  }

  async askContactPermissions () {
    const {status: existingStatus} = await Permissions.getAsync(
      Permissions.CONTACTS
    )
    let finalStatus = existingStatus
    if (existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.CONTACTS)
      finalStatus = status
    }

    let contacts = []
    if (finalStatus === 'granted') {
      const {data} = await expoContacts.getContactsAsync()

      contacts = data.map((contact) => {
        const contactEmails = contact.emails || []
        const contactPhones = contact.phoneNumbers || []
        const emails = contactEmails.map((email) => {
          return email.email
        })
        const phones = contactPhones.map((phone) => {
          return phone.number
        })

        const display = {uri: '', initials: ''}
        if (contact.image) {
          display.uri = contact.image.uri
        } else {
          const {firstName, lastName} = contact
          let initials = ''
          if (firstName) {
            initials = initials.concat(firstName.charAt(0))
          }
          if (lastName) {
            initials = initials.concat(lastName.charAt(0))
          }
          display.initials = initials
        }
        return {
          id: contact.id,
          name: contact.name,
          display: display,
          phones: Array.from(new Set(phones)),
          emails: Array.from(new Set(emails))
        }
      })
      contacts.sort((a, b) => a.name.localeCompare(b.name))
    }
    this.setState({permission: finalStatus, contacts: contacts})
  }

  renderContact (contact) {
    const {name, id, display} = contact

    let image
    if (display.uri) {
      image = (
        <Image
          source={{uri: display.uri}}
          style={{borderRadius: 30, height: 60, width: 60}}/>)
    } else {
      image = (
        <View style={{
          height: 60,
          width: 60,
          borderRadius: 30,
          backgroundColor: 'lightgray',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Text style={{fontSize: 20}}>{display.initials}</Text>
        </View>
      )
    }
    return (
      <TouchableOpacity
        key={id}
        style={{
          paddingLeft: 12,
          marginVertical: 6,
          flexDirection: 'row',
          alignItems: 'center'
        }}
        onPress={() => this.props.navigation.navigate('Contact', contact)}>
        {image}
        <Text style={{fontSize: 20, paddingLeft: 10}}>{name}</Text>
      </TouchableOpacity>
    )
  }

  renderContacts () {
    const {contacts} = this.state
    return (
      <ScrollView>
        {contacts.map((contact) => this.renderContact(contact))}
      </ScrollView>
    )
  }

  render () {
    const {contacts, permission} = this.state

    let body
    if (permission === 'granted') {
      if (contacts.length === 0) {
        body = (
          <View
            style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text>You have no contacts.</Text>
          </View>
        )
      } else {
        body = this.renderContacts()
      }
    } else if (permission === 'denied') {
      body = (
        <View
          style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <Text>Ferly needs permission to access your contacts.</Text>
        </View>
      )
    } else {
      body = <Spinner />
    }

    return (
      <View style={{flex: 1}}>
        {body}
      </View>
    )
  }
}

Contacts.propTypes = {
  navigation: PropTypes.object.isRequired
}
