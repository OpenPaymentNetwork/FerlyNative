import PrimaryButton from 'ferly/components/PrimaryButton';
import PropTypes from 'prop-types';
import React from 'react';
import Theme from 'ferly/utils/theme';
import {
  View,
  Text,
  TextInput,
  Alert
} from 'react-native';
import {apiExpire} from 'ferly/store/api';
import {StackActions} from 'react-navigation';
import {connect} from 'react-redux';
import {createUrl, post} from 'ferly/utils/fetch';

export class ManualAdd extends React.Component {
  static navigationOptions = {
    title: 'Add New'
  };

  constructor (props) {
    super(props);
    this.state = {
      fieldValue: '',
      error: '',
      submitting: false
    };
  }

  submit (option) {
    this.setState({submitting: true});
    post('invite', this.props.deviceToken, {recipient: option})
      .then((response) => response.json())
      .then((json) => {
        this.setState({submitting: false});
        if (this.validate(json)) {
          this.props.apiExpire(
            createUrl('existing-invitations', {status: 'pending'}));
          const resetAction = StackActions.reset({
            index: 0,
            actions: [StackActions.push({routeName: 'Invitations'})]
          });
          this.props.navigation.dispatch(resetAction);
          Alert.alert('Invite Sent!', `You sent an invite to ${option}.`);
        }
      })
      .catch(() => {
        Alert.alert('Error trying to invite!');
        navigator.navigate('Home');
      });
  }

  validate (json) {
    if (json.invalid) {
      this.setState({error: json.invalid.recipient});
      return false;
    } else {
      return true;
    }
  }

  render () {
    count++;
    if (count < 2) {
      const text = {'text': 'Manual Add'};
      post('log-info', this.props.deviceToken, text)
        .then((response) => response.json())
        .then((responseJson) => {
        })
        .catch(() => {
          Alert.alert('Error please check internet connection!');
        });
    }
    const {fieldValue, error, submitting} = this.state;
    return (
      <View style={{
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: 'white'
      }}>
        <View style={{margin: 20}}>
          <Text style={{fontSize: 16, marginBottom: 14}}>
            Enter an email address or phone number to send an invitation to.
          </Text>
          <View style={{borderBottomWidth: 1, borderColor: 'gray'}}>
            <TextInput
              onChangeText={(text) => this.setState({fieldValue: text})}
              autoFocus
              underlineColorAndroid={'transparent'}
              returnKeyType='done'
              style={{flexShrink: 1, minWidth: '100%'}}
              keyboardType="email-address"
              value={fieldValue} />
          </View>
          <Text style={{color: 'red'}}>{error}</Text>
        </View>
        <PrimaryButton
          title="Send Invitation"
          disabled={!fieldValue || submitting}
          color={Theme.lightBlue}
          onPress={() => this.submit(fieldValue.trim())}
        />
      </View>
    );
  }
}

let count = 0;

ManualAdd.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(ManualAdd);
