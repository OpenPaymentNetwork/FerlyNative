import React from 'react';
import PrimaryButton from 'ferly/components/PrimaryButton';
import Theme from 'ferly/utils/theme';
import PropTypes from 'prop-types';
import {setDoneTutorial} from 'ferly/store/settings';
import {connect} from 'react-redux';
import {apiRefresh} from 'ferly/store/api';
import {urls, post} from 'ferly/utils/fetch';
import {
  AsyncStorage,
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
        this.props.dispatch(apiRefresh(urls.profile));
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

  async storage () {
    AsyncStorage.setItem('codeRedeemed', 'needed').then(() => {
      AsyncStorage.setItem('doneTutorial', '').then(() => {
        try {
          this.props.dispatch(setDoneTutorial(''));
        } catch (error) {
          Alert.alert('error', error);
        }
      });
    });
  }

  submitForm = () => {
    const {pan, pin} = this.state;
    this.setState({submitting: true});
    post('add-card', this.props.deviceToken, {pan, pin})
      .then((response) => response.json())
      .then((json) => {
        this.setState({submitting: false, pin: '', invalid: {}});
        if (this.validateAddCard(json)) {
          const text = {'text': 'successful add card'};
          post('log-info', this.props.deviceToken, text)
            .then((response) => response.json())
            .then((responseJson) => {
            })
            .catch(() => {
              console.log('log error');
            });
          this.storage().then((response) => {
          })
            .catch(() => {
              Alert.alert('Error trying to add card!');
            });
          this.props.dispatch(apiRefresh(urls.profile));
        }
      })
      .catch(() => {
        const text = {'text': 'Call failed: add card new'};
        post('log-info', this.props.deviceToken, text)
          .then((response) => response.json())
          .then((responseJson) => {
          })
          .catch(() => {
            console.log('log error');
          });
        Alert.alert('Error trying to add card!');
        navigator.navigate('Wallet');
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
      this.setState({invalid: newInvalid});
      return false;
    } else {
      return json.result;
    }
  }

  render () {
    count++;
    if (count < 2) {
      const text = {'text': 'New Card Form'};
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
            <Text style={styles.title}>Add Card Information</Text>
            <Text style={styles.instructions}>{instructions}</Text>
          </View>
          <View style={{paddingHorizontal: 15}} >
            <View style={styles.inputContainer}>
              <TextInput
                style={{fontSize: width > 600 ? 22 : 18}}
                placeholder="Card Number"
                underlineColorAndroid='transparent'
                keyboardType='numeric'
                maxLength={19}
                returnKeyType='done'
                onChangeText={this.onChangePan}
                value={pan.replace(/(.{4})/g, '$1 ').trim()} />
            </View>
            <Text style={styles.errorText}>{panError}</Text>
            <View style={styles.inputContainer}>
              <TextInput
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
            <Text style={styles.errorText}>{pinError}</Text>
            <PrimaryButton
              title="Add"
              disabled={
                submitting ||
            pan.length !== 16 ||
            pin.length !== 4 ||
            !this.validateCardNumber(pan)
              }
              color={Theme.lightBlue}
              onPress={() => this.submitForm()}
            />
          </View>
        </View>
      </View>
    );
  }
}
let count = 0;
const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  cardContainer: {
    justifyContent: 'space-around',
    flexDirection: 'row',
    padding: 20
  },
  panText: {fontSize: 20, padding: 20, color: 'white'},
  inputContainer: {
    borderWidth: 1,
    height: width > 600 ? 40 : 35,
    paddingLeft: 10,
    marginVertical: 15,
    justifyContent: 'center'
  },
  title: {fontSize: width > 600 ? 24 : 22, fontWeight: 'bold', color: Theme.darkBlue},
  errorText: {color: 'red'},
  labelText: {color: 'gray'},
  instructions: {
    fontSize: width > 600 ? 18 : 16,
    paddingHorizontal: 6,
    paddingVertical: 10,
    color: Theme.darkBlue
  },
  actionsContainer: {
    marginHorizontal: 20,
    borderTopWidth: 0.5,
    borderTopColor: 'gray'
  },
  actionRow: {flexDirection: 'row', padding: 10, alignItems: 'center'},
  modalPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalDialog: {
    backgroundColor: 'white',
    height: 160,
    width: 260,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10
  }
});

CardForm.propTypes = {
  navigation: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
  card: PropTypes.object,
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

export default connect(mapStateToProps)(CardForm);
