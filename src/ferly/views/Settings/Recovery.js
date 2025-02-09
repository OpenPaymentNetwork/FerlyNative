import PropTypes from 'prop-types';
import React from 'react';
import Spinner from 'ferly/components/Spinner';
import TestElement from 'ferly/components/TestElement';
import UIDController from 'ferly/views/Settings/UIDController';
import {apiRequire} from 'ferly/store/api';
import {connect} from 'react-redux';
import {urls, post} from 'ferly/utils/fetch';
import {Alert, View, Text, ScrollView, KeyboardAvoidingView, Dimensions} from 'react-native';

export class Recovery extends React.Component {
  static navigationOptions = {
    title: 'Account Recovery'
  };

  componentDidMount () {
    this.props.apiRequire(urls.profile);
  }

  render () {
    count++;
    if (count < 2) {
      const text = {'text': 'Recovery'};
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
    const {email, phone, navigation, myProfile} = this.props;

    let form;
    if (Object.keys(myProfile).length === 0) {
      form = <Spinner />;
    } else {
      form = (
        <View>
          <View>
            <TestElement
              parent={UIDController}
              label='test-id-recovery-email' type="email" uid={email} navigation={navigation} />
          </View>
          <View style={{borderBottomColor: 'gray', borderBottomWidth: 0.5}}/>
          <View>
            < TestElement
              parent={UIDController}
              label='test-id-recovery-phone' type="phone" uid={phone} navigation={navigation} />
          </View>
        </View>
      );
    }

    const message = `If you replace your phone or uninstall the Ferly app, ` +
      `you'll need to recover your account. Add an email address or phone ` +
      `number we can verify and use for account recovery.`;
    const note = `If you don't enter an email address or phone number, your ` +
      `account cannot be recovered, which may result in the loss of gift ` +
      `value you hold.`;
    return (
      <KeyboardAvoidingView
        style={{flex: 1, backgroundColor: 'white'}}
        keyboardVerticalOffset={80}
        behavior="padding">
        <ScrollView keyboardShouldPersistTaps='handled' contentContainerStyle={{flexGrow: 1}}>
          <View style={{paddingHorizontal: 20, paddingTop: 20}}>
            <Text
              allowFontScaling={false}
              style={{fontSize: width > 600 ? 18 : 16, marginBottom: 8}}>{message}</Text>
            <Text
              allowFontScaling={false}
              style={{fontSize: width > 600 ? 18 : 16}}>
              <Text
                allowFontScaling={false}
                style={{fontWeight: 'bold'}}>NOTE: </Text>
              {note}
            </Text>
          </View>
          {form}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

let count = 0;
const {width} = Dimensions.get('window');

Recovery.propTypes = {
  apiRequire: PropTypes.func.isRequired,
  email: PropTypes.string,
  myProfile: PropTypes.object,
  phone: PropTypes.string,
  navigation: PropTypes.object.isRequired,
  deviceToken: PropTypes.string.isRequired
};

function mapStateToProps (state) {
  const {deviceToken} = state.settings;
  const apiStore = state.api.apiStore;
  const myProfile = apiStore[urls.profile] || {};
  const {uids = []} = myProfile;
  let emails = [];
  let phones = [];
  uids.forEach((uid) => {
    const split = uid.split(':');
    if (split[0] === 'email') {
      emails.push(split[1]);
    } else if (split[0] === 'phone') {
      phones.push(split[1]);
    }
  });

  return {
    myProfile,
    email: emails[0],
    phone: phones[0],
    deviceToken
  };
}

const mapDispatchToProps = {
  apiRequire
};

export default connect(mapStateToProps, mapDispatchToProps)(Recovery);
