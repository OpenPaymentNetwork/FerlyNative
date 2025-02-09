import PrimaryButton from 'ferly/components/PrimaryButton';
import PropTypes from 'prop-types';
import React from 'react';
import {apiRefresh, apiExpire} from 'ferly/store/api';
import Spinner from 'ferly/components/Spinner';
import Theme from 'ferly/utils/theme';
import {connect} from 'react-redux';
import {post, urls} from 'ferly/utils/fetch';
import {StackActions} from 'react-navigation';
import { ConfirmDialog } from 'react-native-simple-dialogs';
import {Present} from 'ferly/images/index';
import Constants from 'expo-constants';
import {
  AsyncStorage,
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Dimensions,
  Image
} from 'react-native';

const {releaseChannel} = Constants.manifest;

export class EnterCode extends React.Component {
  static navigationOptions = {
    title: 'Enter Code'
  };

  constructor (props) {
    super(props);
    this.state = {
      code: '',
      fieldValue: '',
      invalid: '',
      submitting: false,
      showDialog: false
    };
  }

  componentDidMount () {
    if (releaseChannel !== 'production') {
      this.retrieveData().then(() => {
      }).catch(() => {
        Alert.alert('Error trying to get gift code!');
      });
    }
  }

  retrieveData = async () => {
    try {
      const giftCode = await AsyncStorage.getItem('giftCode') || '';
      if (giftCode !== '') {
        this.setState({code: giftCode});
      }
    } catch (error) {
      Alert.alert('Error trying to retrieve gift code');
    }
  }

  onClickHistory () {
    const resetAction = StackActions.reset({
      index: 0,
      actions: [
        StackActions.push({routeName: 'Menu'})
      ]
    });
    this.props.navigation.dispatch(resetAction);
    this.setState({showDialog: false});
    this.props.navigation.navigate('History');
  }

  onClickWallet () {
    const resetAction = StackActions.reset({
      index: 0,
      actions: [
        StackActions.push({routeName: 'Menu'})
      ]
    });
    this.props.navigation.dispatch(resetAction);
    this.setState({showDialog: false});
    this.props.navigation.navigate('Home');
  }

  submitForm = () => {
    const {fieldValue, code} = this.state;
    let invalidCode = true;
    this.setState({submitting: true});
    const postCode = {
      'code': fieldValue === '' ? code : fieldValue
    };
    post('get-invalid-code-count', this.props.deviceToken)
      .then((response) => response.json())
      .then((json) => {
        if (this.validateCodeCount(json)) {
          const text = {'text': 'successful get invalid code count'};
          post('log-info', this.props.deviceToken, text)
            .then((response) => response.json())
            .then((responseJson) => {
            })
            .catch(() => {
              console.log('log error');
            });
          post('accept-code', this.props.deviceToken, postCode)
            .then((response) => response.json())
            .then((json) => {
              this.setState({submitting: false, fieldValue: '', invalid: ''});
              if (this.validateCode(json)) {
                const text = {'text': 'successful accept code'};
                post('log-info', this.props.deviceToken, text)
                  .then((response) => response.json())
                  .then((responseJson) => {
                  })
                  .catch(() => {
                    console.log('log error');
                  });
                invalidCode = false;
                this.props.dispatch(apiRefresh(urls.profile));
                this.props.dispatch(apiExpire(urls.history));
                this.props.dispatch(apiRefresh(urls.history));
                const buttons = [
                  {text: 'OK',
                    onPress: () => {
                      const resetAction = StackActions.reset({
                        index: 0,
                        actions: [
                          StackActions.push({routeName: 'Menu'})
                        ]
                      });
                      this.props.navigation.dispatch(resetAction);
                      this.props.navigation.navigate('Wallet');
                    }},
                  {text: 'VIEW',
                    onPress: () => {
                      const resetAction = StackActions.reset({
                        index: 0,
                        actions: [
                          StackActions.push({routeName: 'Menu'})
                        ]
                      });
                      this.props.navigation.dispatch(resetAction);
                      this.props.navigation.navigate('History');
                    }}
                ];
                try {
                  title = json.transfer;
                  title = title['appdata.ferly.title'];
                  amount = json.transfer.amount;
                  sender = json.transfer.sender_info.title;
                  message = json.transfer.message;
                  this.setState({showDialog: true});
                } catch (error) {
                  Alert.alert('Gift Accepted', `You successfully accepted gift value.`, buttons);
                  this.props.navigation.navigate('Wallet');
                }
              }
              post('update-invalid-code-count', this.props.deviceToken, {
                'invalid_result': invalidCode
              })
                .then((response) => response.json())
                .then((json) => {
                  if (json.error || json.invalid) {
                    const text = {'text': 'Unsuccessful update invalid code count'};
                    post('log-info', this.props.deviceToken, text)
                      .then((response) => response.json())
                      .then((responseJson) => {
                      })
                      .catch(() => {
                        console.log('log error');
                      });
                  }
                  const text = {'text': 'successful update invalid code count'};
                  post('log-info', this.props.deviceToken, text)
                    .then((response) => response.json())
                    .then((responseJson) => {
                    })
                    .catch(() => {
                      console.log('log error');
                    });
                })
                .catch(() => {
                  console.log('unable to update code count');
                });
            })
            .catch(() => {
              const text = {'text': 'Call failed: accept code'};
              post('log-info', this.props.deviceToken, text)
                .then((response) => response.json())
                .then((responseJson) => {
                })
                .catch(() => {
                  console.log('log error');
                });
              Alert.alert('Error trying to submit code!');
              navigator.navigate('Wallet');
            });
        }
      })
      .catch(() => {
        const text = {'text': 'Call failed: get invalid code count'};
        post('log-info', this.props.deviceToken, text)
          .then((response) => response.json())
          .then((responseJson) => {
          })
          .catch(() => {
            console.log('log error');
          });
        Alert.alert('Error trying to submit code!');
        navigator.navigate('Wallet');
      });
  }

  validateCodeCount = (json) => {
    const text = {'text': 'Validate code count'};
    post('log-info', this.props.deviceToken, text)
      .then((response) => response.json())
      .then((responseJson) => {
      })
      .catch(() => {
        console.log('log error');
      });
    if (json.invalid || json.error) {
      const text = {'text': 'Unsuccessful code count invalid'};
      post('log-info', this.props.deviceToken, text)
        .then((response) => response.json())
        .then((responseJson) => {
        })
        .catch(() => {
          console.log('log error');
        });
      this.setState({invalid: 'Unable to validate code at this time.'});
      return false;
    } else if (parseInt(json.count) > parseInt('5')) {
      const text = {'text': 'Unsuccessful code count'};
      post('log-info', this.props.deviceToken, text)
        .then((response) => response.json())
        .then((responseJson) => {
        })
        .catch(() => {
          console.log('log error');
        });
      this.setState({invalid: 'Too many failed attempts.', submitting: false});
      return false;
    } else {
      return true;
    }
  }

  validateCode = (json) => {
    const text = {'text': 'Validate code'};
    post('log-info', this.props.deviceToken, text)
      .then((response) => response.json())
      .then((responseJson) => {
      })
      .catch(() => {
        console.log('log error');
      });
    if (json.invalid || json.error) {
      const text = {'text': 'Unsuccessful code'};
      post('log-info', this.props.deviceToken, text)
        .then((response) => response.json())
        .then((responseJson) => {
        })
        .catch(() => {
          console.log('log error');
        });
      this.setState({invalid: 'Invalid Code.'});
      return false;
    } else {
      return true;
    }
  }

  render () {
    const {fieldValue, submitting, invalid, code} = this.state;

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
    if (count >= 2) {
      count = 0;
    }

    return (
      <View
        keyboardShouldPersistTaps='handled'
        style={{
          flex: 1,
          justifyContent: 'space-between',
          backgroundColor: 'white'}}>
        <View style={{
          paddingHorizontal: width < 330 ? 30 : width > 600 ? 50 : 40, paddingVertical: 30
        }}>
          <Text
            allowFontScaling={false}
            style={{fontSize: width > 600 ? 22 : 18, textAlign: 'center'}}>
            {`Enter gift code sent to your email or phone to accept a gift.`}
          </Text>
          <View style={{paddingVertical: width < 330 ? 30 : width > 600 ? 40 : 35}}>
            <View style={{
              borderWidth: 1,
              width: width > 600 ? 160 : 150,
              alignSelf: 'center',
              borderColor: invalid ? 'red' : 'gray'}}>
              <TextInput
                allowFontScaling={false}
                keyboardShouldPersistTaps = 'handled'
                maxLength={7}
                autoCapitalize = 'characters'
                style={{
                  fontSize: width > 600 ? 24 : 22,
                  paddingVertical: width > 600 ? 10 : 5,
                  paddingHorizontal: width > 600 ? 20 : 15,
                  alignSelf: 'center'
                }}
                onChangeText={(text) => {
                  text = text.replace(/-/g, '');
                  this.setState({fieldValue: text, code: text});
                  if (text.length === 4 && text[3] === '-') {
                    text = text.substring(0, 3);
                  } else if (text.length > 3) {
                    text = text.substring(0, 3) + '-' + text.substr(text.length - (text.length - 3));
                  }
                  this.setState({fieldValue: text, code: text});
                }}
                returnKeyType='done'
                placeholder="123-ABC"
                value={this.state.code !== '' ? this.state.code : fieldValue} />
            </View>
            {invalid ? (<Text allowFontScaling={false}style={styles.error}>{invalid}</Text>) : null}
          </View>
          <PrimaryButton
            marginHorizontal={1}
            title="Accept Gift"
            disabled={(fieldValue === '' && code === '') || submitting}
            color={Theme.lightBlue}
            onPress={() => this.submitForm()} />
        </View>
        {submitting ? <Spinner /> : null}
        <ConfirmDialog
          visible={this.state.showDialog}
          onTouchOutside={() => this.setState({showDialog: false})}
          positiveButton={{
            title: 'SEE MORE',
            onPress: () => this.onClickHistory()
          }}
          negativeButton={{
            title: 'OK',
            onPress: () => this.onClickWallet()
          }}>
          <View style={{alignItems: 'center'}}>
            <Image style={{height: 140, width: 140, marginBottom: 20}} source={Present}/>
            <Text
              allowFontScaling={false}
              style={{marginBottom: 10, fontSize: 22, fontWeight: 'bold'}}>
              Congrats!
            </Text>
            <Text
              allowFontScaling={false}
              style={{marginBottom: 10, fontSize: 16, color: 'gray'}}>
              {`You accepted ${amount} of ${title} from ${sender}.`}
            </Text>
            <Text
              allowFontScaling={false}
              style={{color: 'gray'}}>
              {!message ? null : '"' + message + '"'}
            </Text>
          </View>
        </ConfirmDialog>
      </View>
    );
  }
}

let count = 0;
let title;
let amount;
let sender;
let message;
let {width} = Dimensions.get('window');

EnterCode.propTypes = {
  dispatch: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  deviceToken: PropTypes.string.isRequired,
  expoToken: PropTypes.string,
  initialExpoToken: PropTypes.string
};

const styles = StyleSheet.create({
  error: {
    fontSize: width > 600 ? 18 : 16,
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
