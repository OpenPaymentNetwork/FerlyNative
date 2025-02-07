import React from 'react';
import PrimaryButton from 'ferly/components/PrimaryButton';
import Theme from 'ferly/utils/theme';
import Spinner from 'ferly/components/Spinner';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {apiRefresh} from 'ferly/store/api';
import {urls, post} from 'ferly/utils/fetch';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  Dimensions
} from 'react-native';

export class CardForm extends React.Component {
    static navigationOptions = {
      title: 'Activate Ferly Card'
    }

    constructor (props) {
      super(props);
      this.state = {
        pan: '',
        pin: '',
        invalid: {},
        submitting: false,
        assumedAbility: null,
        changingAbility: false,
        showNewPinModal: false
      };
    }

    componentWillUnmount () {
      const {assumedAbility} = this.state;
      if (assumedAbility !== null) {
        this.props.apiRefresh(urls.profile);
      }
    }
    validateCardNumber (code) {
      var len = code.length;
      var parity = len % 2;
      var sum = 0;
      for (var i = len - 1; i >= 0; i--) {
        var d = parseInt(code.charAt(i));
        if (i % 2 === parity) { d *= 2; }
        if (d > 9) { d -= 9; }
        sum += d;
      }
      return sum % 10 === 0;
    }

  onChangePan = (value) => {
    const withoutSpaces = value.replace(/\s/g, '');
    const {invalid} = this.state;
    if (withoutSpaces.length === 16) {
      const newInvalid = Object.assign({}, invalid);
      if (!this.validateCardNumber(withoutSpaces)) {
        newInvalid.pan = 'Invalid card number';
      } else {
        delete newInvalid.pan;
      }
      this.setState({invalid: newInvalid});
    }
    this.setState({pan: withoutSpaces});
  }

  onChangePin = (newPin) => {
    this.setState({pin: newPin});
  }

  submitForm = () => {
    const {pan, pin} = this.state;
    this.setState({submitting: true});
    post('add-card', this.props.deviceToken, {pan, pin})
      .then((response) => response.json())
      .then((json) => {
        this.setState({pin: '', invalid: {}});
        if (this.validateAddCard(json)) {
          const text = {'text': 'succesful add card'};
          post('log-info', this.props.deviceToken, text)
            .then((response) => response.json())
            .then((responseJson) => {
            })
            .catch(() => {
              console.log('log error');
            });
          this.props.apiRefresh(urls.profile);
          this.setState({submitting: false});
          const alertText = 'Your card is ready to use. Remember to select ' +
            'debit when using your card.';
          Alert.alert('Success', alertText);
        }
      })
      .catch(() => {
        const text = {'text': 'Call failed: add card'};
        post('log-info', this.props.deviceToken, text)
          .then((response) => response.json())
          .then((responseJson) => {
          })
          .catch(() => {
            console.log('log error');
          });
        Alert.alert('Error trying to add card!');
        this.props.navigation.navigate('Home');
      });
  }

  validateAddCard = (json) => {
    const text = {'text': 'Validate add card'};
    post('log-info', this.props.deviceToken, text)
      .then((response) => response.json())
      .then((responseJson) => {
      })
      .catch(() => {
        console.log('log error');
      });
    if (json.invalid) {
      const text = {'text': 'Unsuccessful add card'};
      post('log-info', this.props.deviceToken, text)
        .then((response) => response.json())
        .then((responseJson) => {
        })
        .catch(() => {
          console.log('log error');
        });
      const newInvalid = json.invalid;
      if (newInvalid['']) {
        newInvalid.pan = newInvalid[''];
      }
      this.setState({invalid: newInvalid, submitting: false});
      return false;
    } else {
      return json.result;
    }
  }

  render () {
    count++;
    if (count < 2) {
      const text = {'text': 'Card Form'};
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
    const {pin, pan, invalid, submitting} = this.state;
    const {pin: pinError, pan: panError} = invalid;

    const instructions = 'Enter the 16-digit number found on the back of ' +
      'your Ferly Card and set a 4-digit PIN you\'ll remember later.';
    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <View style={{flex: 1, paddingVertical: 20}}>
          <View style={{paddingBottom: 10, alignItems: 'center', paddingHorizontal: 10}}>
            <Text
              allowFontScaling={false}
              style={styles.title}>Add Card Information</Text>
            <Text
              allowFontScaling={false}
              style={styles.instructions}>{instructions}</Text>
          </View>
          <View style={{paddingHorizontal: 15}} >
            <View style={styles.inputContainer}>
              <TextInput
                allowFontScaling={false}
                style={{fontSize: width > 600 ? 22 : 18}}
                placeholder="Card Number"
                underlineColorAndroid='transparent'
                keyboardType='numeric'
                maxLength={19}
                returnKeyType='done'
                onChangeText={this.onChangePan}
                value={pan.replace(/(.{4})/g, '$1 ').trim()} />
            </View>
            <Text
              allowFontScaling={false}
              style={styles.errorText}>{panError}</Text>
            <View style={styles.inputContainer}>
              <TextInput
                allowFontScaling={false}
                style={{fontSize: width > 600 ? 22 : 18}}
                placeholder="Pin"
                underlineColorAndroid='transparent'
                keyboardType='numeric'
                maxLength={4}
                returnKeyType='done'
                onChangeText={this.onChangePin}
                value={pin} />
            </View>
          </View>
          <View style={{width: '100%'}} >
            <Text
              allowFontScaling={false}
              style={styles.errorText}>{pinError}</Text>
            {submitting ? <Spinner/>
              : <PrimaryButton
                title="Add"
                disabled={
                  submitting ||
            pan.length !== 16 ||
            pin.length !== 4 ||
            !this.validateCardNumber(pan)
                }
                color={Theme.lightBlue}
                onPress={this.submitForm}
              />
            }
          </View>
        </View>
      </View>
    );
  }
}

let count = 0;
const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  inputContainer: {
    borderWidth: 1,
    height: width > 600 ? 40 : 35,
    paddingLeft: 10,
    marginVertical: 15,
    justifyContent: 'center'
  },
  title: {fontSize: width > 600 ? 24 : 22, fontWeight: 'bold', color: Theme.darkBlue},
  errorText: {color: 'red'},
  instructions: {
    fontSize: width > 600 ? 18 : 16,
    paddingHorizontal: 6,
    paddingVertical: 10,
    color: Theme.darkBlue
  }
});

CardForm.propTypes = {
  navigation: PropTypes.object,
  apiRefresh: PropTypes.func.isRequired,
  deviceToken: PropTypes.string.isRequired
};

function mapStateToProps (state) {
  const {deviceToken} = state.settings;
  const apiStore = state.api.apiStore;
  const data = apiStore[urls.profile];
  const {cards} = data || {};
  let card;
  if (cards) {
    card = cards[0];
  }
  return {
    loaded: !!data,
    card,
    deviceToken
  };
}

const mapDispatchToProps = {
  apiRefresh
};

export default connect(mapStateToProps, mapDispatchToProps)(CardForm);
