import PrimaryButton from 'ferly/components/PrimaryButton';
import PropTypes from 'prop-types';
import React from 'react';
import Theme from 'ferly/utils/theme';
import {connect} from 'react-redux';
import {post} from 'ferly/utils/fetch';
import {View, Text, TextInput, StyleSheet, Alert} from 'react-native';

export class EnterCode extends React.Component {
  static navigationOptions = {
    title: 'Enter Code'
  };

  constructor (props) {
    super(props);
    this.state = {
      fieldValue: '',
      invalid: '',
      submitting: false
    };
  }

  submitForm = () => {
    const {fieldValue} = this.state;
    this.setState({submitting: true});
    const postCode = {
      'code': fieldValue
    };
    post('accept-code', this.props.deviceToken, postCode)
      .then((response) => response.json())
      .then((json) => {
        this.setState({submitting: false, fieldValue: '', invalid: ''});
        if (this.validateCode(json)) {
          const buttons = [
            {text: 'OK', onPress: () => this.props.navigation.navigate('Wallet'), style: 'cancel'},
            {text: 'VIEW', onPress: () => this.props.navigation.navigate('History')}
          ];
          try {
            let title = json.transfer;
            title = title['appdata.ferly.title'];
            Alert.alert('Gift Accepted', `You accepted $${json.transfer.amount} of ${title} from ` +
           `${json.transfer.sender_info.title}. Click View to see details.`, buttons);
          } catch (error) {
            Alert.alert('Gift Accepted', `You successfully accepted gift value.`, buttons);
            this.props.navigation.navigate('Wallet');
          }
        }
      })
      .catch(() => {
        Alert.alert('Error trying to submit code!');
        navigator.navigate('Wallet');
      });
  }

  validateCode = (json) => {
    if (json.invalid || json.error) {
      this.setState({invalid: 'Invalid Code.'});
      return false;
    } else {
      return true;
    }
  }

  render () {
    const {fieldValue, submitting, invalid} = this.state;

    count++;
    if (count < 2) {
      const text = {'text': 'enter code'};
      post('log-info', this.props.deviceToken, text)
        .then((response) => response.json())
        .then((responseJson) => {
        })
        .catch(() => {
          Alert.alert('Error please check internet connection!');
        });
    }

    return (
      <View style={{
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: 'white'}}>
        <View style={{paddingHorizontal: 40, paddingVertical: 30}}>
          <Text style={{fontSize: 18, textAlign: 'center'}}>
            {`Enter gift code sent to your email or phone to accept a gift.`}
          </Text>
          <View style={{paddingVertical: 20}}>
            <View style={{
              borderWidth: 1,
              width: 150,
              alignSelf: 'center',
              borderColor: invalid ? 'red' : 'gray'}}>
              <TextInput
                style={{
                  fontSize: 22,
                  paddingVertical: 5,
                  paddingHorizontal: 15,
                  alignSelf: 'center'
                }}
                onChangeText={(text) => this.setState({fieldValue: text})}
                autoFocus
                returnKeyType='done'
                placeholder="123-456"
                value={fieldValue} />
            </View>
            {invalid ? (<Text style={styles.error}>{invalid}</Text>) : null}
          </View>
          <PrimaryButton
            marginHorizontal={1}
            title="Accept Gift"
            disabled={fieldValue === '' || submitting}
            color={Theme.lightBlue}
            onPress={() => this.submitForm()} />
        </View>
      </View>
    );
  }
}

let count = 0;

EnterCode.propTypes = {
  dispatch: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  deviceToken: PropTypes.string.isRequired,
  expoToken: PropTypes.string,
  initialExpoToken: PropTypes.string
};

const styles = StyleSheet.create({
  error: {
    fontSize: 16,
    color: 'red',
    alignSelf: 'center'
  }
});

function mapStateToProps (state) {
  const {deviceToken, expoToken, initialExpoToken} = state.settings;
  return {
    deviceToken,
    expoToken,
    initialExpoToken
  };
}

export default connect(mapStateToProps)(EnterCode);
