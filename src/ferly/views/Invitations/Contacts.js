import * as expoContacts from 'expo-contacts';
import * as Permissions from 'expo-permissions';
import Avatar from 'ferly/components/Avatar';
import PropTypes from 'prop-types';
import React from 'react';
import SearchBar from 'ferly/components/SearchBar';
import TestElement from 'ferly/components/TestElement';
import {connect} from 'react-redux';
import {post} from 'ferly/utils/fetch';
import {
  Alert,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Platform
} from 'react-native';

export class Contacts extends React.Component {
  static navigationOptions = {
    title: 'Select Recipient'
  };

  constructor (props) {
    super(props);
    this.state = {
      permission: undefined,
      contacts: undefined,
      hasMore: true,
      pageSize: 25000,
      pageOffset: 0,
      searchResults: null
    };
  }

  componentDidMount () {
    this.askContactPermission();
  }

  async askContactPermission () {
    const {status: existingStatus} = await Permissions.getAsync(
      Permissions.CONTACTS
    );
    let finalStatus = existingStatus;
    if (finalStatus !== 'granted') {
      const {status} = await Permissions.askAsync(Permissions.CONTACTS);
      finalStatus = status;
    }
    this.setState({permission: finalStatus});
  }

  async searchContacts (name) {
    const {contacts} = this.state;
    if (Platform.OS === 'ios') {
      const {data} = await expoContacts.getContactsAsync({name: name});
      this.setState({searchResults: this.convertDataToContacts(data)});
    } else {
      let list = [];
      contacts.forEach(function (item) {
        let firstName = item.display.firstName || '';
        let lastName = item.display.lastName || '';
        let lowerCaseName = name.toLowerCase();
        let fullName = firstName.toLowerCase() + ' ' + lastName.toLowerCase();
        if (fullName.toLowerCase().includes(lowerCaseName)) {
          list.push(item);
        }
      });
      list = list.slice(0, 50);
      this.setState({searchResults: list});
    }
  }

  async getContacts () {
    const {pageSize, pageOffset, contacts: currentContacts = []} = this.state;
    let test = {};
    try {
      test = await expoContacts.getContactsAsync({
        pageSize, pageOffset, sort: expoContacts.SortTypes.FirstName});
    } catch (error) {
      // This is a workaround for an expo bug
      test = await expoContacts.getContactsAsync({
        pageSize, pageOffset});
      if (contacts.length < 1) {
        contacts.push(test);
      }
      test.data = test.data.filter(item => item.firstName !== undefined);
      test.data.sort((a, b) => (a.firstName > b.firstName) ? 1 : -1);
    }
    const {data} = test;
    const moreContacts = this.convertDataToContacts(data);
    const hasMore = pageSize === moreContacts.length;
    this.setState({
      contacts: currentContacts.concat(moreContacts),
      pageOffset: pageOffset + pageSize,
      hasMore
    });
  }

  loadMore () {
    if (this.state.hasMore) {
      this.getContacts();
    }
  }

  convertDataToContacts (data) {
    return data.map((contact) => {
      const contactEmails = contact.emails || [];
      const contactPhones = contact.phoneNumbers || [];
      const emails = contactEmails.map((email) => {
        return email.email;
      });
      const phones = contactPhones.map((phone) => {
        return phone.number;
      });

      const display = {uri: '', firstName: '', lastName: ''};
      if (contact.image) {
        display.uri = contact.image.uri;
      }
      display.firstName = contact.firstName;
      display.lastName = contact.lastName;
      return {
        id: contact.id,
        name: contact.name,
        display: display,
        phones: Array.from(new Set(phones)),
        emails: Array.from(new Set(emails))
      };
    });
  }

  onChangeText (text) {
    if (text !== '') {
      this.searchContacts(text);
    } else {
      this.setState({searchResults: null});
    }
  }

  renderContact (contact) {
    const {name, id, display} = contact;
    const {firstName, lastName, uri} = display;
    return (
      <TestElement
        parent={TouchableOpacity}
        label='test-id-recipient-contacts'
        key={id}
        style={{
          paddingLeft: 12,
          marginVertical: 6,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'white'
        }}
        onPress={() => this.props.navigation.navigate('Contact', contact)}>
        <Avatar
          size={60}
          firstWord={firstName}
          secondWord={lastName}
          pictureUrl={uri} />
        <Text style={{fontSize: 20, paddingLeft: 10}}>{name}</Text>
      </TestElement>
    );
  }

  render () {
    count++;
    if (count < 2) {
      const text = {'text': 'Contacts'};
      post('log-info', this.props.deviceToken, text)
        .then((response) => response.json())
        .then((responseJson) => {
        })
        .catch(() => {
          Alert.alert('Error please check internet connection!');
        });
    }
    const {contacts, permission, searchResults} = this.state;
    if (permission !== 'granted') {
      return (
        <View
          style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <Text>Ferly needs permission to access your contacts.</Text>
        </View>
      );
    } else if (contacts && contacts.length === 0) {
      return (
        <View
          style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <Text>You have no contacts.</Text>
        </View>
      );
    }

    // Search only works on ios
    const searchBar = (
      <SearchBar onChangeText={this.onChangeText.bind(this)} />
    );
    let contactsList;
    if (searchResults) {
      if (searchResults.length === 0) {
        contactsList = <Text>No contacts match your search.</Text>;
      } else {
        contactsList = (
          <ScrollView>
            {searchResults.map((contact) => this.renderContact(contact))}
          </ScrollView>
        );
      }
    } else {
      contactsList = (
        <FlatList
          onEndReached={this.loadMore()}
          onEndReachedThreshold={10}
          keyExtractor={(contact) => contact.id}
          data={contacts}
          renderItem={(contact) => this.renderContact(contact.item)} />
      );
    }

    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        {searchBar}
        {contactsList}
      </View>
    );
  }
}

let contacts = [];

let count = 0;

Contacts.propTypes = {
  navigation: PropTypes.object.isRequired,
  deviceToken: PropTypes.string.isRequired
};

function mapStateToProps (state, ownProps) {
  const {deviceToken} = state.settings;
  return {
    deviceToken
  };
}

export default connect(mapStateToProps)(Contacts);
