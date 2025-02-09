import Avatar from 'ferly/components/Avatar';
import Icon from 'react-native-vector-icons/FontAwesome';
import PropTypes from 'prop-types';
import React from 'react';
import {apiExpire} from 'ferly/store/api';
import {connect} from 'react-redux';
import {createUrl, post} from 'ferly/utils/fetch';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';

export class Contact extends React.Component {
  static navigationOptions = {
    title: 'Select Method'
  };

  submit (option) {
    post('invite', this.props.deviceToken, {recipient: option})
      .then((response) => response.json())
      .then((json) => {
        if (json.error || json.invalid) {
          const text = {'text': 'Unsuccessful invite contact'};
          post('log-info', this.props.deviceToken, text)
            .then((response) => response.json())
            .then((responseJson) => {
            })
            .catch(() => {
              console.log('log error');
            });
        }
        const text = {'text': 'successful invite'};
        post('log-info', this.props.deviceToken, text)
          .then((response) => response.json())
          .then((responseJson) => {
          })
          .catch(() => {
            console.log('log error');
          });
        if (Object.keys(json).length > 0) {
          const text = {'text': 'Unsuccessful invite'};
          post('log-info', this.props.deviceToken, text)
            .then((response) => response.json())
            .then((responseJson) => {
            })
            .catch(() => {
              console.log('log error');
            });
          Alert.alert('Error', `Unable to send to ${option}`);
          return;
        }
        this.props.apiExpire(
          createUrl('existing-invitations', {status: 'pending'}));
        this.props.navigation.navigate('Invitations');
        Alert.alert('Invite Sent!', `You sent an invite to ${option}.`);
      })
      .catch(() => {
        const text = {'text': 'Call failed: invite contact'};
        post('log-info', this.props.deviceToken, text)
          .then((response) => response.json())
          .then((responseJson) => {
          })
          .catch(() => {
            console.log('log error');
          });
        Alert.alert('Error trying to send invite!');
        navigator.navigate('Home');
      });
  }

  confirm (option) {
    Alert.alert(
      'Confirm',
      `Are you sure you'd like to send an invitation to ${option}.`,
      [
        {text: 'No', onPress: null},
        {text: 'Yes', onPress: () => this.submit(option)}
      ]
    );
  }

  renderOption (option) {
    return (
      <TouchableOpacity
        key={option}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 32,
          paddingHorizontal: 20
        }}
        onPress={() => this.confirm(option)}>
        <Icon
          name={option.indexOf('@') > -1 ? 'envelope' : 'phone'}
          color='black'
          size={26} />
        <Text
          allowFontScaling={false}
          style={{fontSize: 22, paddingLeft: 20}}>{option}</Text>
      </TouchableOpacity>
    );
  }

  render () {
    count++;
    if (count < 2) {
      const text = {'text': 'Contact'};
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
    const contact = this.props.navigation.state.params;
    const options = contact.phones.concat(contact.emails);
    const {display} = contact;
    return (
      <ScrollView keyboardShouldPersistTaps='handled' contentContainerStyle={{flex: 1, backgroundColor: 'white'}}>
        <View
          style={{
            paddingTop: 40,
            paddingBottom: 20,
            flexDirection: 'row',
            justifyContent: 'center'}}>
          <View style={{alignItems: 'center'}}>
            <Avatar
              size={100}
              firstWord={display.firstName}
              secondWord={display.lastName}
              pictureUrl={display.uri} />
            <Text
              allowFontScaling={false}
              style={{fontSize: 26, paddingTop: 10}}>{contact.name}</Text>
          </View>
        </View>
        {options.map((option) => this.renderOption(option))}
      </ScrollView>
    );
  }
}

let count = 0;

Contact.propTypes = {
  apiExpire: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  deviceToken: PropTypes.string.isRequired
};

function mapStateToProps (state) {
  const {deviceToken} = state.settings;
  return {
    deviceToken
  };
}

const mapDispatchToProps = {
  apiExpire
};

export default connect(mapStateToProps, mapDispatchToProps)(Contact);
