import Avatar from 'ferly/components/Avatar';
import PropTypes from 'prop-types';
import React from 'react';
import SearchBar from 'ferly/components/SearchBar';
import Spinner from 'ferly/components/Spinner';
import Theme from 'ferly/utils/theme';
import {apiRequire} from 'ferly/store/api';
import {connect} from 'react-redux';
import {createUrl, urls, post} from 'ferly/utils/fetch';
import {Alert, ScrollView, Text, TouchableOpacity, View} from 'react-native';

class Recipient extends React.Component {
  static navigationOptions = {
    title: 'Recipient'
  }

  constructor (props) {
    super(props);
    this.state = {
      searchResults: null,
      searchText: ''
    };
  }

  componentDidMount () {
    this.props.apiRequire(urls.profile);
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
          if (this.state.searchText === text) { // The customer is done typing.
            this.setState({searchResults: json.results});
          }
        })
        .catch(() => {
          Alert.alert('Error trying to search!');
        });
    }
    this.setState({searchText: text});
  }

  renderCustomers (customers) {
    const {navigation} = this.props;
    const design = navigation.state.params;

    return (
      <ScrollView style={{flex: 1}}>
        {
          customers.map((customer) => {
            const firstName = customer.first_name;
            const lastName = customer.last_name;
            return (
              <TouchableOpacity
                key={customer.id}
                onPress={
                  () => navigation.navigate('Amount', {customer, design})}>
                <View marginVertical={10} style={{flexDirection: 'row'}}>
                  <Avatar
                    size={68}
                    pictureUrl={customer.profile_image_url}
                    firstWord={firstName}
                    secondWord={lastName} />
                  <View style={{justifyContent: 'center', marginLeft: 10}}>
                    <Text style={{fontSize: 24}}>
                      {`${firstName} ${lastName}`}
                    </Text>
                    <Text style={{fontSize: 20, color: 'gray'}}>
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
          Alert.alert('Error trying to log!');
        });
    }
    const {recents} = this.props;
    const {searchResults, searchText} = this.state;
    let body;
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
        );
      } else {
        body = this.renderCustomers(searchResults);
      }
    } else {
      let display = <Spinner />;
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
          );
        } else {
          display = this.renderCustomers(recents);
        }
      }
      body = (
        <View style={{flex: 1}}>
          <Text style={{fontSize: 18, color: Theme.lightBlue}}>
            Most Recent Recipients
          </Text>
          {display}
        </View>
      );
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
    );
  }
}

let count = 0;

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
