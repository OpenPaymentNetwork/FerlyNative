import PrimaryButton from 'ferly/components/PrimaryButton';
import PropTypes from 'prop-types';
import React from 'react';
import Recaptcha from 'ferly/components/Recaptcha';
import Theme from 'ferly/utils/theme';
import {setIsCustomer, setDoneTutorial} from 'ferly/store/settings';
import {connect} from 'react-redux';
import {post} from 'ferly/utils/fetch';
import {AsyncStorage, View, Text, TextInput, StyleSheet, Alert, Dimensions} from 'react-native';

export class SignUpCode extends React.Component {
  static navigationOptions = {
    title: 'Verify Email/Phone Number'
  };

  constructor (props) {
    super(props);
    this.state = {
      fieldValue: props.navigation.state.params.code || '',
      invalid: '',
      submitting: false,
      recaptchaResponse: '',
      expoToken: '',
      showRecaptcha: false,
      resubmit: false
    };
  }

  componentDidUpdate (prevProps, prevState) {
    const {resubmit, recaptchaResponse} = this.state;
    if (resubmit && recaptchaResponse) {
      this.handleSubmit();
    }
  }

  async storage () {
    AsyncStorage.setItem('doneTutorial', 'false').then(() => {
      try {
        this.props.dispatch(setDoneTutorial('false'));
      } catch (error) {
        Alert.alert('error', error);
      }
    });
    AsyncStorage.setItem('isCustomer', 'true').then(() => {
      try {
        this.props.dispatch(setIsCustomer('true'));
      } catch (error) {
        Alert.alert('error', error);
      }
    });
    AsyncStorage.setItem('codeRedeemed', 'needed').then(() => {
    });
  }

  handleSubmit () {
    let dontLogin = true;
    const {navigation} = this.props;
    const params = navigation.state.params;
    let {attemptPath, secret, factorId, firstName, lastName, expoToken, username, os} = params;
    const {fieldValue, recaptchaResponse} = this.state;
    this.setState({'submitting': true, invalid: '', resubmit: false});
    attemptPath = attemptPath.substr(1);
    const setParams = {
      first_name: firstName,
      last_name: lastName,
      secret: secret,
      attempt_path: attemptPath
    };
    const agreedParam = {
      agreed: true,
      secret: secret,
      attempt_path: attemptPath
    };
    const postParams = {
      secret: secret,
      attempt_path: attemptPath,
      factor_id: factorId,
      code: fieldValue.replace(/-/g, ''),
      recaptcha_response: recaptchaResponse
    };
    post('auth-uid', this.props.deviceToken, postParams)
      .then((response) => response.json())
      .then((responseJson) => {
        if (this.validate(responseJson)) {
          const text = {'text': 'successful auth uid'};
          post('log-info-initial', this.props.deviceToken, text)
            .then((response) => response.json())
            .then((responseJson) => {
            })
            .catch(() => {
              console.log('log error');
            });
          if (responseJson.profile_id) {
            let token = responseJson.expo_token;
            if (!token) {
              token = expoToken;
            }
            const loginParams = {
              profile_id: responseJson.profile_id,
              os: responseJson.os,
              expo_token: token
            };
            post('login', this.props.deviceToken, loginParams)
              .then((response) => response.json())
              .then((responseJson) => {
                if (!responseJson.error) {
                  const text = {'text': 'successful login'};
                  post('log-info-initial', this.props.deviceToken, text)
                    .then((response) => response.json())
                    .then((responseJson) => {
                    })
                    .catch(() => {
                      console.log('log error');
                    });
                  this.storage().then((responseJson) => {
                    navigation.navigate('Wallet');
                    dontLogin = false;
                  });
                }
              })
              .catch(() => {
                const text = {'text': 'Call failed: login'};
                post('log-info-inital', this.props.deviceToken, text)
                  .then((response) => response.json())
                  .then((responseJson) => {
                  })
                  .catch(() => {
                    console.log('log error');
                  });
                Alert.alert('Error please check internet connectionin!');
              });
          } else if (dontLogin) {
            post('set-signup-data', this.props.deviceToken, setParams)
              .then((response) => response.json())
              .then((responseJson) => {
                if (this.validate(responseJson)) {
                  const text = {'text': 'successful set signup data'};
                  post('log-info-initial', this.props.deviceToken, text)
                    .then((response) => response.json())
                    .then((responseJson) => {
                    })
                    .catch(() => {
                      console.log('log error');
                    });
                  post('signup-finish', this.props.deviceToken, agreedParam)
                    .then((response) => response.json())
                    .then((responseJson) => {
                      if (this.validate(responseJson)) {
                        const text = {'text': 'successful signup finish'};
                        post('log-info-initial', this.props.deviceToken, text)
                          .then((response) => response.json())
                          .then((responseJson) => {
                          })
                          .catch(() => {
                            console.log('log error');
                          });
                        if (!expoToken) {
                          if (!this.props.initialExpoToken) {
                            expoToken = this.props.expoToken;
                          } else {
                            expoToken = this.props.initialExpoToken;
                          }
                        }
                        const finalParams = {
                          first_name: firstName,
                          last_name: lastName,
                          username: username,
                          profile_id: responseJson.profile_id,
                          attempt_path: attemptPath,
                          secret: secret,
                          expo_token: expoToken,
                          os: os,
                          factor_id: factorId,
                          code: fieldValue.replace(/-/g, ''),
                          recaptcha_response: recaptchaResponse
                        };
                        post('register', this.props.deviceToken, finalParams)
                          .then((response) => response.json())
                          .then((responseJson) => {
                            if (this.validate(responseJson)) {
                              const text = {'text': 'successful register'};
                              post('log-info-initial', this.props.deviceToken, text)
                                .then((response) => response.json())
                                .then((responseJson) => {
                                })
                                .catch(() => {
                                  console.log('log error');
                                });
                              this.storage().then((responseJson) => {
                                navigation.navigate('Tutorial');
                              });
                            }
                          })
                          .catch(() => {
                            const text = {'text': 'Call failed: register'};
                            post('log-info-inital', this.props.deviceToken, text)
                              .then((response) => response.json())
                              .then((responseJson) => {
                              })
                              .catch(() => {
                                console.log('log error');
                              });
                            Alert.alert('Error trying to register!');
                          });
                      }
                    })
                    .catch(() => {
                      const text = {'text': 'Call failed: signup finish'};
                      post('log-info-inital', this.props.deviceToken, text)
                        .then((response) => response.json())
                        .then((responseJson) => {
                        })
                        .catch(() => {
                          console.log('log error');
                        });
                      Alert.alert('Error trying to sign up!');
                    });
                }
              })
              .catch(() => {
                const text = {'text': 'Call failed: set signup data'};
                post('log-info-inital', this.props.deviceToken, text)
                  .then((response) => response.json())
                  .then((responseJson) => {
                  })
                  .catch(() => {
                    console.log('log error');
                  });
                Alert.alert('Error trying to sign up!');
              });
          }
        }
      })
      .catch(() => {
        const text = {'text': 'Call failed: signupcode auth uid'};
        post('log-info-inital', this.props.deviceToken, text)
          .then((response) => response.json())
          .then((responseJson) => {
          })
          .catch(() => {
            console.log('log error');
          });
        Alert.alert('Error trying to sign up!');
      });
  }

  validate (json) {
    const text = {'text': 'Validate sign up'};
    post('log-info-initial', this.props.deviceToken, text)
      .then((response) => response.json())
      .then((responseJson) => {
      })
      .catch(() => {
        console.log('log error');
      });
    if (json.invalid) {
      const text = {'text': 'Unsuccessful sign up invalid'};
      post('log-info', this.props.deviceToken, text)
        .then((response) => response.json())
        .then((responseJson) => {
        })
        .catch(() => {
          console.log('log error');
        });
      this.setState({
        invalid: json.invalid[Object.keys(json.invalid)[0]],
        submitting: false});
      return false;
    } else if (json.error === 'unexpected_auth_attempt') {
      const text = {'text': 'Unsuccessful sign up unexpected auth'};
      post('log-info', this.props.deviceToken, text)
        .then((response) => response.json())
        .then((responseJson) => {
        })
        .catch(() => {
          console.log('log error');
        });
      this.setState({submitting: false});
      Alert.alert(
        'Error', 'This account does not exist. Please go back and try again.');
      return false;
    } else if (json.error === 'recaptcha_required') {
      const text = {'text': 'Unsuccessful sign up recaptcha required'};
      post('log-info', this.props.deviceToken, text)
        .then((response) => response.json())
        .then((responseJson) => {
        })
        .catch(() => {
          console.log('log error');
        });
      this.setState({showRecaptcha: true, resubmit: true, submitting: false});
      return false;
    } else if (json.error === 'code_expired') {
      const text = {'text': 'Unsuccessful sign up code expired'};
      post('log-info', this.props.deviceToken, text)
        .then((response) => response.json())
        .then((responseJson) => {
        })
        .catch(() => {
          console.log('log error');
        });
      this.setState({submitting: false});
      Alert.alert(
        'Sorry', 'This code has expired. Please try again with a new code.');
      return false;
    } else if (json.error) {
      const text = {'text': 'Unsuccessful sign up'};
      post('log-info', this.props.deviceToken, text)
        .then((response) => response.json())
        .then((responseJson) => {
        })
        .catch(() => {
          console.log('log error');
        });
      this.setState({submitting: false});
      Alert.alert('Unexpected error!', 'Please try again later.');
      return false;
    } else {
      return true;
    }
  }

  onExecute (response) {
    this.setState({recaptchaResponse: response, showRecaptcha: false});
  }

  render () {
    const {fieldValue, submitting, invalid, showRecaptcha} = this.state;
    const {navigation} = this.props;
    const params = navigation.state.params;
    const {codeLength, loginType} = params;

    count++;
    if (count < 2) {
      const text = {'text': 'sign up code'};
      post('log-info-initial', this.props.deviceToken, text)
        .then((response) => response.json())
        .then((responseJson) => {
        })
        .catch(() => {
          Alert.alert('Error please check internet connection!');
        });
    }

    let channelType = 'device';
    if (loginType === 'email') {
      channelType = 'email address';
    } else if (loginType === 'phone') {
      channelType = 'phone number';
    }

    const recaptchaComponent = (
      <Recaptcha onExecute={this.onExecute.bind(this)} action="uid" />);

    return (
      <View style={{
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: 'white'}}>
        <View style={{paddingHorizontal: 40, paddingVertical: 30}}>
          <Text
            allowFontScaling={false}
            style={{fontSize: width > 600 ? 22 : 18}}>
            {`We sent a unique and temporary code to your ${channelType}. ` +
             `Enter the ${codeLength}-digit code below.`}
          </Text>
          <View style={{
            borderBottomWidth: 1,
            borderColor: 'gray',
            paddingTop: 20}}>
            <TextInput
              allowFontScaling={false}
              style={{fontSize: width > 600 ? 22 : 18}}
              onChangeText={(text) => this.setState({fieldValue: text})}
              autoFocus
              returnKeyType='done'
              placeholder="Enter code"
              keyboardType="numeric"
              value={fieldValue} />
            {showRecaptcha ? recaptchaComponent : null}
          </View>
          {invalid ? (<Text
            allowFontScaling={false}
            style={styles.error}>{invalid}</Text>) : null}
        </View>
        <PrimaryButton
          title="Verify Email/Phone"
          disabled={fieldValue === '' || submitting}
          color={Theme.lightBlue}
          onPress={this.handleSubmit.bind(this)} />
      </View>
    );
  }
}

let count = 0;
let {width} = Dimensions.get('window');

SignUpCode.propTypes = {
  dispatch: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  deviceToken: PropTypes.string.isRequired,
  expoToken: PropTypes.string,
  initialExpoToken: PropTypes.string
};

const styles = StyleSheet.create({
  error: {
    fontSize: width > 600 ? 22 : 16,
    color: 'red'
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

export default connect(mapStateToProps)(SignUpCode);
