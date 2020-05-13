import PrimaryButton from 'ferly/components/PrimaryButton';
import PropTypes from 'prop-types';
import React from 'react';
import Theme from 'ferly/utils/theme';
import {connect} from 'react-redux';
import {post} from 'ferly/utils/fetch';
import {Alert, View, Text, TextInput, StyleSheet, TouchableOpacity, Dimensions} from 'react-native';

export class RecoveryChannel extends React.Component {
  static navigationOptions = {
    title: 'Recover Account'
  };

  constructor (props) {
    super(props);
    this.state = {
      fieldValue: '',
      invalid: '',
      submitting: false
    };
  }

  handleSubmit () {
    const {navigation} = this.props;
    const params = navigation.state.params;
    const {expoToken} = params;
    const {fieldValue} = this.state;

    this.setState({'submitting': true, invalid: ''});

    post('recover', this.props.deviceToken, {'login': fieldValue})
      .then((response) => response.json())
      .then((responseJson) => {
        if (this.validate(responseJson)) {
          const text = {'text': 'successful recover'};
          post('log-info-inital', this.props.deviceToken, text)
            .then((response) => response.json())
            .then((responseJson) => {
            })
            .catch(() => {
              console.log('log error');
            });
          this.setState({submitting: false});
          const codeLength = responseJson.code_length;
          let code = '';
          if (responseJson.revealed_codes) {
            code = responseJson.revealed_codes[0].substring(0, codeLength);
          }
          const navParams = {
            attemptPath: responseJson.attempt_path,
            secret: responseJson.secret,
            factorId: responseJson.factor_id,
            expoToken: expoToken,
            code: code,
            loginType: responseJson.login_type,
            codeLength: codeLength
          };
          navigation.navigate('RecoveryCode', navParams);
        }
      })
      .catch(() => {
        const text = {'text': 'Call failed: recover'};
        post('log-info-inital', this.props.deviceToken, text)
          .then((response) => response.json())
          .then((responseJson) => {
          })
          .catch(() => {
            console.log('log error');
          });
        Alert.alert('Error trying to recover!');
      });
  }

  validate (json) {
    const text = {'text': 'Validate recover'};
    post('log-info-inital', this.props.deviceToken, text)
      .then((response) => response.json())
      .then((responseJson) => {
      })
      .catch(() => {
        console.log('log error');
      });
    if (json.invalid) {
      const text = {'text': 'Unsuccessful recover invalid'};
      post('log-info', this.props.deviceToken, text)
        .then((response) => response.json())
        .then((responseJson) => {
        })
        .catch(() => {
          console.log('log error');
        });
      this.setState({invalid: json.invalid, submitting: false});
      return false;
    } else if (json.error) {
      const text = {'text': 'Unsuccessful recover'};
      post('log-info', this.props.deviceToken, text)
        .then((response) => response.json())
        .then((responseJson) => {
        })
        .catch(() => {
          console.log('log error');
        });
      this.setState({invalid: {'login': 'Error occured please try again'}, submitting: false});
      return false;
    }
    return true;
  }

  renderRecoveryOption () {
    const {navigation} = this.props;
    const params = navigation.state.params;
    const {expoToken} = params;
    const signUpParams = {
      expoToken: expoToken
    };
    return (
      <View style={{
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 30}}>
        <Text
          allowFontScaling={false}
          style={{fontSize: width > 600 ? 20 : 16}}>{`Don't have an account?`}</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('SignUp', signUpParams)}>
          <Text
            allowFontScaling={false}
            style={{
              color: '#65C7C7',
              textDecorationLine: 'underline',
              fontSize: width > 600 ? 20 : 16,
              paddingLeft: 5}}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    );
  }

  render () {
    const {fieldValue, invalid, submitting} = this.state;
    count++;
    if (count < 2) {
      const text = {'text': 'sign in'};
      post('log-info-initial', this.props.deviceToken, text)
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
        <View style={{paddingVertical: 30}}>
          <View style={{paddingHorizontal: 15, paddingBottom: width > 600 ? 20 : 0}} >
            <TextInput
              allowFontScaling={false}
              style={{
                fontSize: width > 600 ? 22 : 18,
                borderWidth: 1,
                borderRadius: 5,
                marginVertical: width > 600 ? 20 : 15,
                width: '100%',
                height: width > 600 ? 45 : 35,
                paddingLeft: 10}}
              onChangeText={(text) => this.setState({fieldValue: text})}
              autoFocus
              placeholder="Phone Number or Email"
              keyboardType="email-address"
              value={fieldValue} />
            {
              invalid.login
                ? (<Text
                  allowFontScaling={false}
                  style={styles.error}>{invalid.login}</Text>)
                : null
            }
          </View>
          <View style={{width: '100%'}} >
            <PrimaryButton
              title="Next"
              disabled={fieldValue === '' || submitting}
              color={Theme.lightBlue}
              onPress={this.handleSubmit.bind(this)} />
          </View>
          {this.renderRecoveryOption()}
        </View>
      </View>
    );
  }
}

let count = 0;
let {width} = Dimensions.get('window');

RecoveryChannel.propTypes = {
  navigation: PropTypes.object.isRequired,
  deviceToken: PropTypes.string.isRequired
};

const styles = StyleSheet.create({
  error: {
    marginBottom: 35,
    fontSize: width > 600 ? 20 : 16,
    color: 'red'
  }
});

function mapStateToProps (state) {
  const {deviceToken} = state.settings;
  return {
    deviceToken
  };
}

export default connect(mapStateToProps)(RecoveryChannel);
