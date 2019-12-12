import Avatar from 'ferly/components/Avatar';
import Icon from 'react-native-vector-icons/FontAwesome';
import PropTypes from 'prop-types';
import React from 'react';
import {apiExpire} from 'ferly/store/api';
import {connect} from 'react-redux';
import {post} from 'ferly/utils/fetch';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';

export class GiveContact extends React.Component {
  static navigationOptions = {
    title: 'Select Method'
  };

  confirm (option) {
    const {navigation} = this.props;
    const params = navigation.state.params;
    let {contact, design} = params;
    const {display} = contact;
    const moreParams = {
      contactName: display,
      design: design,
      contact: option
    };
    navigation.navigate('Amount', moreParams);
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
    const {navigation} = this.props;
    const params = navigation.state.params;
    let {contact} = params;
    const options = contact.phones.concat(contact.emails);
    const {display} = contact;
    return (
      <ScrollView contentContainerStyle={{flex: 1, backgroundColor: 'white'}}>
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
            <Text style={{fontSize: 26, paddingTop: 10}}>{contact.name}</Text>
          </View>
        </View>
        {options.map((option) => this.renderOption(option))}
      </ScrollView>
    );
  }
}

let count = 0;

GiveContact.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(GiveContact);
