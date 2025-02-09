import * as expoContacts from 'expo-contacts';
import * as Permissions from 'expo-permissions';
import Avatar from 'ferly/components/Avatar';
import PropTypes from 'prop-types';
import PrimaryButton from 'ferly/components/PrimaryButton';
import React from 'react';
import SearchBar from 'ferly/components/SearchBar';
import Spinner from 'ferly/components/Spinner';
import Theme from 'ferly/utils/theme';
import TestElement from 'ferly/components/TestElement';
import {apiRequire} from 'ferly/store/api';
import {connect} from 'react-redux';
import {createUrl, urls, post} from 'ferly/utils/fetch';
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  StyleSheet,
  FlatList,
  Platform,
  Dimensions
} from 'react-native';

class Recipient extends React.Component {
  static navigationOptions = {
    title: 'Recipient'
  }

  componentDidMount () {
    this.props.apiRequire(urls.profile);
  }

  constructor (props) {
    super(props);
    this.state = {
      submitting: false,
      permission: undefined,
      contacts: undefined,
      searchResults: null,
      searchText: '',
      searchContact: null,
      hasMore: true,
      pageSize: 25000,
      pageOffset: 0,
      page: 'Users',
      name: '',
      error: '',
      contact: ''
    };
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
      this.setState({searchContact: this.convertDataToContacts(data)});
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
      this.setState({searchContact: list});
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
      try {
        test = await expoContacts.getContactsAsync({
          pageSize, pageOffset});
        if (contacts.length < 1) {
          contacts.push(test);
        }
        test.data = test.data.filter(item => item.firstName !== undefined);
        test.data.sort((a, b) => (a.firstName > b.firstName) ? 1 : -1);
      } catch (error) {
        console.log('unable to get contacts');
      }
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

  onChangeContact (text) {
    this.setState({searchText: text});
    if (text !== '') {
      this.searchContacts(text);
    } else {
      this.setState({searchContact: null});
    }
  }
  renderContact (contact) {
    const {navigation} = this.props;
    const design = navigation.state.params;
    const {name, id, display} = contact;
    const {firstName, lastName, uri} = display;
    const passParams = {
      name: name,
      contact: contact,
      design: design
    };
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
        onPress={() => this.props.navigation.navigate('GiveContact', passParams)}>
        <Avatar
          size={60}
          firstWord={firstName}
          secondWord={lastName}
          pictureUrl={uri} />
        <Text
          allowFontScaling={false}
          style={{fontSize: 20, paddingLeft: 10}}>{name}</Text>
      </TestElement>
    );
  }

  changeToContacts () {
    this.onChangeContact('');
    this.setState({page: 'Contacts'});
    this.askContactPermission();
  }

  changeToOther () {
    this.setState({page: 'Other'});
  }

  changeToUsers () {
    this.onChangeText('');
    this.setState({page: 'Users'});
  }

  onNext () {
    const {navigation} = this.props;
    const design = navigation.state.params;
    const {name, contact} = this.state;
    this.setState({submitting: true});
    if (contact.includes('@')) {
      if (!contact.includes('.')) {
        this.setState({error: 'Invalid email address', submitting: false});
      } else {
        navigation.navigate('Amount', {name, contact, design});
      }
    } else {
      let numbers = /^[0-9]+$/;
      if (contact.match(numbers)) {
        navigation.navigate('Amount', {name, contact, design});
      } else {
        this.setState({error: 'Invalid phone number', submitting: false});
      }
    }
  }

  onChangeText (text) {
    const query = text[0] === '@' ? text.slice(1) : text;
    if (query === '') {
      this.setState({searchResults: null});
    } else {
      fetch(createUrl('search-customers', {query: query}), {
        headers: {
          Authorization: 'Bearer ' + this.props.deviceToken
        }})
        .then((response) => response.json())
        .then((json) => {
          if (json.error || json.invalid) {
            const text = {'text': 'Unsuccessful search customer'};
            post('log-info', this.props.deviceToken, text)
              .then((response) => response.json())
              .then((responseJson) => {
              })
              .catch(() => {
                console.log('log error');
              });
          }
          if (this.state.searchText === text) { // The customer is done typing.
            this.setState({searchResults: json.results});
          }
        })
        .catch(() => {
          const text = {'text': 'Call failed: search customer'};
          post('log-info', this.props.deviceToken, text)
            .then((response) => response.json())
            .then((responseJson) => {
            })
            .catch(() => {
              console.log('log error');
            });
          Alert.alert('Error trying to search!');
        });
    }
    this.setState({searchText: text});
  }

  renderCustomers (customers) {
    const {navigation} = this.props;
    const design = navigation.state.params;
    return (
      <ScrollView keyboardShouldPersistTaps='handled' style={{flex: 1}}>
        {
          customers.map((customer) => {
            const firstName = customer.first_name;
            const lastName = customer.last_name;
            let name = firstName + ' ' + lastName;
            return (
              <TouchableOpacity
                key={customer.id}
                onPress={
                  () => navigation.navigate('Amount', {customer, design, name})}>
                <View marginVertical={10} style={{flexDirection: 'row'}}>
                  <Avatar
                    size={width > 600 ? 72 : 68}
                    pictureUrl={customer.profile_image_url}
                    firstWord={firstName}
                    secondWord={lastName} />
                  <View style={{justifyContent: 'center', marginLeft: 10}}>
                    <Text
                      allowFontScaling={false}
                      style={{fontSize: width > 600 ? 28 : 24}}>
                      {`${name}`}
                    </Text>
                    <Text
                      allowFontScaling={false}
                      style={{fontSize: width > 600 ? 24 : 20, color: 'gray'}}>
                      {'@' + customer.username}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        }
      </ScrollView>
    );
  }

  render () {
    count++;
    if (count < 2) {
      const text = {'text': 'Recipient'};
      post('log-info', this.props.deviceToken, text)
        .then((response) => response.json())
        .then((responseJson) => {
        })
        .catch(() => {
          Alert.alert('Error please check internet connection!');
        });
    }
    if (count >= 2) {
      count = 0;
    }
    const {page, permission, contacts, error} = this.state;
    const {recents} = this.props;
    const {searchResults, searchText, name, contact, searchContact} = this.state;
    let body;
    let display = <Spinner />;
    if (page === 'Users') {
      if (searchResults) {
        if (searchResults.length === 0) {
          display = (
            <Text
              allowFontScaling={false}>
              {
                'We\'re sorry, we couldn\'t find anyone matching \'' +
              searchText + '\'. Use invitations in the menu to invite ' +
              'someone to Ferly.'
              }
            </Text>
          );
        } else {
          display = (
            this.renderCustomers(searchResults)
          );
        }
        body = (
          <View style={{flex: 1}}>
            <SearchBar
              value={this.state.searchText}
              placeholder='Search Ferly users'
              onChangeText={this.onChangeText.bind(this)}/>
            <Text
              allowFontScaling={false}
              style={{fontSize: width > 600 ? 20 : 18, color: Theme.lightBlue}}>
              {this.state.searchResults === null ? 'Most Recent Recipients' : null}
            </Text>
            {display}
          </View>
        );
      } else {
        if (recents) {
          if (recents.length === 0) {
            display = (
              <Text
                allowFontScaling={false}>
                {
                  'Search for other users above. Use Contacts or Other to invite ' +
                  'someone you can\'t find.'
                }
              </Text>
            );
          } else {
            display = (
              this.renderCustomers(recents)
            );
          }
        }
        body = (
          <View style={{flex: 1}}>
            <SearchBar
              value={this.state.searchText}
              placeholder='Search Ferly users'
              onChangeText={this.onChangeText.bind(this)}/>
            <Text
              allowFontScaling={false}
              style={{
                fontSize: width > 600 ? 20 : 18, color: Theme.lightBlue, marginHorizontal: 10
              }}>
              {this.state.searchResults === null ? 'Most Recent Recipients' : null}
            </Text>
            {display}
          </View>
        );
      }
    } else if (page === 'Other') {
      body = (
        <View style={{paddingHorizontal: 10}}>
          <View style={styles.text}>
            <Text
              allowFontScaling={false}
              style={{fontSize: width > 600 ? 18 : 16}}>
              Enter the recipients name and email address or phone number.
            </Text>
          </View>
          <View style={[styles.inputContainer, {marginTop: 25}]}>
            <TextInput
              allowFontScaling={false}
              placeholder="Recipient Name"
              style={{fontSize: width > 600 ? 14 : 12}}
              onChangeText={(text) => this.setState({name: text})}
              maxLength={50}/>
          </View>
          <View style={[styles.inputContainer, {marginBottom: error === '' ? 25 : 5}]}>
            <TextInput
              allowFontScaling={false}
              placeholder="Email Address or Phone Number"
              style={{fontSize: width > 600 ? 14 : 12}}
              returnKeyType='done'
              onChangeText={(text) => this.setState({contact: text})}
              maxLength={50}/>
          </View>
          {error ? (<Text allowFontScaling={false}style={styles.error}>{error}</Text>) : null}
          <View style={{marginHorizontal: -15}}>
            <PrimaryButton
              title="Next"
              disabled={
                name === '' ||
                contact === ''
              }
              color={Theme.lightBlue}
              onPress={this.onNext.bind(this)}
            />
          </View>
        </View>
      );
    } else if (page === 'Contacts') {
      let contactsList;
      if (searchContact) {
        if (searchContact.length === 0) {
          contactsList = <Text
            allowFontScaling={false}>No contacts match your search.</Text>;
        } else {
          contactsList = (
            <ScrollView keyboardShouldPersistTaps='handled'>
              {searchContact.map((contact) => this.renderContact(contact))}
            </ScrollView>
          );
        }
      } else {
        contactsList = (
          <FlatList
            keyboardShouldPersistTaps='handled'
            onEndReached={this.loadMore()}
            onEndReachedThreshold={10}
            keyExtractor={(contact) => contact.id}
            data={contacts}
            renderItem={(contact) => this.renderContact(contact.item)} />
        );
      }
      if (permission === undefined) {
        body = (
          <View>
            <View style={{paddingVertical: 15, paddingHorizontal: 12}}>
              <Text
                allowFontScaling={false}
                style={{fontSize: width > 600 ? 20 : 18}}>
              Enable contacts to easily send a gift to anyone in your contact list.
              </Text>
            </View>
          </View>
        );
      } else if (permission === 'denied') {
        body = (
          <View>
            <View style={{paddingVertical: 15, paddingHorizontal: 12}}>
              <Text
                allowFontScaling={false}
                style={{fontSize: width > 600 ? 20 : 18}}>
                Go to Settings and allow the Ferly app to access your Contacts to send gift to
                someone in your contacts list.
              </Text>
            </View>
          </View>
        );
      } else {
        if (contactsList.props && contactsList.props.data && contactsList.props.data.length === 0) {
          body = (
            <View
              style={{flex: 1, backgroundColor: 'white'}}>
              <View style={{alignItems: 'center', paddingTop: 30}}>
                <Text style={{fontSize: 16}}>
                  No contacts available.
                </Text>
              </View>
            </View>
          );
        } else {
          body = (
            <View
              style={{flex: 1, backgroundColor: 'white'}}>
              <SearchBar
                value={this.state.searchText}
                onChangeText={this.onChangeContact.bind(this)}
                placeholder='Search Contacts' />
              {contactsList}
            </View>
          );
        }
      }
    }

    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            backgroundColor: Theme.darkBlue
          }}>
          <TestElement
            parent={TouchableOpacity}
            label='test-id-recipient-navbar-contacts'
            style={{
              borderBottomWidth: this.state.page === 'Contacts' ? 4 : 0,
              borderColor: 'white',
              height: width > 600 ? 80 : 60,
              width: width > 600 ? 120 : 100,
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onPress={() => this.changeToContacts()}>
            <Text
              allowFontScaling={false}
              style={{color: 'white', fontSize: width > 600 ? 18 : 16}}>
                Contacts
            </Text>
          </TestElement>
          <TestElement
            parent={TouchableOpacity}
            label='test-id-recipient-navbar-users'
            style={{
              borderBottomWidth: this.state.page === 'Users' ? 4 : 0,
              borderColor: 'white',
              height: width > 600 ? 80 : 60,
              width: width > 600 ? 120 : 100,
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onPress={() => this.changeToUsers()}>
            <Text
              allowFontScaling={false}
              style={{color: 'white', fontSize: width > 600 ? 18 : 16}}>
              Users
            </Text>
          </TestElement>
          <TestElement
            parent={TouchableOpacity}
            label='test-id-recipient-navbar-other'
            style={{
              borderBottomWidth: this.state.page === 'Other' ? 4 : 0,
              borderColor: 'white',
              height: width > 600 ? 80 : 60,
              width: width > 600 ? 120 : 100,
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onPress={() => this.changeToOther()}>
            <Text
              allowFontScaling={false}
              style={{color: 'white', fontSize: width > 600 ? 18 : 16}}>
              Other
            </Text>
          </TestElement>
        </View>
        <View style={{flex: 1, marginHorizontal: width > 600 ? 15 : 10}}>
          {body}
        </View>
      </View>
    );
  }
}

let contacts = [];
let count = 0;
const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  inputContainer: {
    borderWidth: 1,
    borderColor: 'gray',
    height: width > 600 ? 50 : 35,
    paddingLeft: width > 600 ? 15 : 10,
    marginVertical: width > 600 ? 15 : 10,
    justifyContent: 'center'
  },
  error: {
    fontSize: width > 600 ? 20 : 16,
    color: 'red',
    alignSelf: 'center',
    marginBottom: width > 600 ? 30 : 25
  },
  text: {
    marginTop: width > 600 ? 25 : 20
  }
});

Recipient.propTypes = {
  apiRequire: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  recents: PropTypes.array,
  deviceToken: PropTypes.string.isRequired
};

function mapStateToProps (state) {
  const {deviceToken} = state.settings;
  const apiStore = state.api.apiStore;
  const {recents} = apiStore[urls.profile] || {};

  return {
    recents,
    deviceToken
  };
}

const mapDispatchToProps = {
  apiRequire
};

export default connect(mapStateToProps, mapDispatchToProps)(Recipient);
