import NewAddressForm from 'ferly/views/FerlyCard/NewAddressForm';
import AwaitingCard from 'ferly/views/FerlyCard/AwaitingCard';
import CardForm from 'ferly/views/FerlyCard/CardForm';
import PropTypes from 'prop-types';
import React from 'react';
import Spinner from 'ferly/components/Spinner';
import Theme from 'ferly/utils/theme';
import {apiRequire, apiRefresh} from 'ferly/store/api';
import {connect} from 'react-redux';
import {ferlyCard} from 'ferly/images/index';
import {Ionicons} from '@expo/vector-icons';
import {urls, post, createUrl} from 'ferly/utils/fetch';
import {
  View,
  ImageBackground,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Modal,
  Dimensions
} from 'react-native';
import { setHaveCard } from '../../store/settings';

export class FerlyCard extends React.Component {
  static navigationOptions = {
    title: 'Ferly Card'
  };

  constructor (props) {
    super(props);
    this.state = {
      invalid: {},
      pinError: '',
      submitting: false,
      assumedAbility: null,
      changingAbility: false,
      showNewPinModal: false,
      passed: '',
      address: {},
      haveCard: false
    };
  }

  componentDidMount () {
    const {haveCard} = this.state;
    this.props.dispatch(apiRequire(urls.profile));
    fetch(createUrl('verify-address'), {
      headers: {
        Authorization: 'Bearer ' + this.props.deviceToken
      }})
      .then((response) => response.json())
      .then((json) => {
        this.setState({address: json});
        if (json['verified'] === 'yes') {
          this.setState({passed: 'true'});
        } else if (json['verified'] === 'no') {
          this.setState({passed: ''});
        } else if (json['error'] === 'No address on file' && haveCard) {
          this.setState({passed: 'false'});
        } else {
          this.setState({passed: ''});
        }
      })
      .catch(() => {
        const text = {'text': 'Call failed: verify address'};
        post('log-info', this.props.deviceToken, text)
          .then((response) => response.json())
          .then((responseJson) => {
          })
          .catch(() => {
            console.log('log error');
          });
        Alert.alert('Error trying to get address!');
      });
    fetch(createUrl('verify-account'), {
      headers: {
        Authorization: 'Bearer ' + this.props.deviceToken
      }})
      .then((response) => response.json())
      .then((responseJson) => {
        if (!responseJson.Verified) {
          Alert.alert('Feature Unavailable', `This feature is available only for invitees. ` +
          `Coming soon to all users. In the meantime, enjoy previewing the Ferly App!`);
          this.props.navigation.navigate('Wallet');
        }
      })
      .catch(() => {
        const text = {'text': 'Call failed: verify account'};
        post('log-info', this.props.deviceToken, text)
          .then((response) => response.json())
          .then((responseJson) => {
          })
          .catch(() => {
            console.log('log error');
          });
        Alert.alert('Error please check internet connection!');
      });
  }

  componentWillUnmount () {
    const {assumedAbility} = this.state;
    if (assumedAbility !== null) {
      this.props.dispatch(apiRefresh(urls.profile));
    }
  }

  changeAbility = (requestedEnable) => {
    const urlTail = requestedEnable ? 'unsuspend-card' : 'suspend-card';
    const {card_id: cardId} = this.props.card;
    const alertTitle = requestedEnable ? 'Card Enabled' : 'Card Disabled';
    const enabledMessage = 'Re-enabling your Ferly Card allows it to be ' +
      'used to spend your gift value.';
    const disabledMessage = 'While your Ferly Card is disabled it cannot be ' +
      'used to spend your gift value and its activity may appear fraudulent.';
    this.setState({assumedAbility: requestedEnable, changingAbility: true});
    Alert.alert(alertTitle, requestedEnable ? enabledMessage : disabledMessage);
    post(urlTail, this.props.deviceToken, {card_id: cardId})
      .then((response) => response.json())
      .then((json) => {
        if (json.error || json.invalid) {
          const text = {'text': 'Unsuccessful card id'};
          post('log-info', this.props.deviceToken, text)
            .then((response) => response.json())
            .then((responseJson) => {
            })
            .catch(() => {
              console.log('log error');
            });
        }
        this.setState({changingAbility: false});
      })
      .catch(() => {
        const text = {'text': 'Call failed: change info ferly card'};
        post('log-info', this.props.deviceToken, text)
          .then((response) => response.json())
          .then((responseJson) => {
          })
          .catch(() => {
            console.log('log error');
          });
        Alert.alert('Error trying to change info!');
        navigator.navigate('Home');
      });
  }

  handleExpirationClick () {
    Alert.alert('Card Expiration',
      'This is your card\'s expiration date. A free replacement card can be ' +
      'requested after expiration. The underlying gift value held in your ' +
      'account does not expire unless permitted by applicable federal ' +
      'or state regulations. See a gift value page to view expiration ' +
      'dates, if any, for the gift value you hold.'
    );
  }

  handleChangePinClick = () => {
    this.setState({showNewPinModal: true});
  }

  removeCard = () => {
    this.setState({submitting: true});
    let {haveCard} = this.state;
    let newAddress = {};
    fetch(createUrl('verify-address'), {
      headers: {
        Authorization: 'Bearer ' + this.props.deviceToken
      }})
      .then((response) => response.json())
      .then((json) => {
        this.setState({address: json});
        newAddress = json;
        if (json['verified'] === 'yes') {
          this.setState({passed: 'true'});
        } else if (json['verified'] === 'no') {
          this.setState({passed: ''});
        } else if (json['error'] === 'No address on file' && haveCard) {
          this.setState({passed: 'false'});
        } else {
          this.setState({passed: ''});
        }
      })
      .catch(() => {
        const text = {'text': 'Call failed: verify address'};
        post('log-info', this.props.deviceToken, text)
          .then((response) => response.json())
          .then((responseJson) => {
          })
          .catch(() => {
            console.log('log error');
          });
        Alert.alert('Error trying to get address!');
      });
    const {card_id: cardId} = this.props.card;
    this.setState({submitting: true});
    post('delete-card', this.props.deviceToken, {card_id: cardId})
      .then((response) => response.json())
      .then((json) => {
        if (json.error || json.invalid) {
          const text = {'text': 'Unsuccessful delete card'};
          post('log-info', this.props.deviceToken, text)
            .then((response) => response.json())
            .then((responseJson) => {
            })
            .catch(() => {
              console.log('log error');
            });
        }
        const text = {'text': 'successful delete card'};
        post('log-info', this.props.deviceToken, text)
          .then((response) => response.json())
          .then((responseJson) => {
          })
          .catch(() => {
            console.log('log error');
          });
        this.props.dispatch(apiRefresh(urls.profile));
        this.setState({passed: ''});
        if (this.state.passed === '') {
          if (!newAddress['address_line1']) {
            this.setState({passed: ''});
          } else {
            let addressLine2 = newAddress['address_line2'] === '' ? '' : newAddress['address_line2'] + '\n';
            Alert.alert(
              'Correct Address?',
              newAddress['address_line1'] + '\n' +
            addressLine2 +
            newAddress['city'] + ' ' +
            newAddress['state'] + ' ' +
            newAddress['zip'],
              [
                {text: 'No',
                  onPress: () => {
                    newAddress['verified'] = 'no';
                    this.props.dispatch(setHaveCard(true));
                    post('request-card', this.props.deviceToken, this.modifyAddress(newAddress))
                      .then((response) => response.json())
                      .then((json) => {
                        if (json.error || json.invalid) {
                          const text = {'text': 'Unsuccessful request card ferly card no'};
                          post('log-info', this.props.deviceToken, text)
                            .then((response) => response.json())
                            .then((responseJson) => {
                            })
                            .catch(() => {
                              console.log('log error');
                            });
                        }
                        const text = {'text': 'successful no request card'};
                        post('log-info', this.props.deviceToken, text)
                          .then((response) => response.json())
                          .then((responseJson) => {
                          })
                          .catch(() => {
                            console.log('log error');
                          });
                        this.setState({passed: ''});
                      })
                      .catch(() => {
                        const text = {'text': 'Call failed: request card ferly card no'};
                        post('log-info', this.props.deviceToken, text)
                          .then((response) => response.json())
                          .then((responseJson) => {
                          })
                          .catch(() => {
                            console.log('log error');
                          });
                        Alert.alert('Error trying to request card!');
                        navigator.navigate('Home');
                      });
                  }},
                {text: 'Yes',
                  onPress: () => {
                    newAddress['verified'] = 'yes';
                    this.props.dispatch(setHaveCard(false));
                    post('request-card', this.props.deviceToken, this.modifyAddress(newAddress))
                      .then((response) => response.json())
                      .then((json) => {
                        if (json.error || json.invalid) {
                          const text = {'text': 'Unsuccessful request card ferly card yes'};
                          post('log-info', this.props.deviceToken, text)
                            .then((response) => response.json())
                            .then((responseJson) => {
                            })
                            .catch(() => {
                              console.log('log error');
                            });
                        }
                        const text = {'text': 'successful yes request card'};
                        post('log-info', this.props.deviceToken, text)
                          .then((response) => response.json())
                          .then((responseJson) => {
                          })
                          .catch(() => {
                            console.log('log error');
                          });
                        this.setState({passed: 'true'});
                      })
                      .catch(() => {
                        const text = {'text': 'Call failed: request card ferly card yes'};
                        post('log-info', this.props.deviceToken, text)
                          .then((response) => response.json())
                          .then((responseJson) => {
                          })
                          .catch(() => {
                            console.log('log error');
                          });
                        Alert.alert('Error trying to request card!');
                        navigator.navigate('Home');
                      });
                  }}
              ]
            );
          }
        }
        this.setState({submitting: false});
      })
      .catch(() => {
        const text = {'text': 'Call failed: delete card ferly card'};
        post('log-info', this.props.deviceToken, text)
          .then((response) => response.json())
          .then((responseJson) => {
          })
          .catch(() => {
            console.log('log error');
          });
        Alert.alert('Error trying to delete card!');
        navigator.navigate('Home');
      });
  }

  modifyAddress = function (address) {
    address['line1'] = address['address_line1'];
    address['zip_code'] = address['zip'].slice(0, 5);
    return address;
  }

  submitNewPin = () => {
    const {card_id: cardId} = this.props.card;
    const {pin} = this.state;
    if (pin.length < 4) {
      this.setState({submitting: false, pinError: 'Must be 4 digits'});
    } else {
      this.setState({submitting: true});
      post('change-pin', this.props.deviceToken, {card_id: cardId, pin: pin})
        .then((response) => response.json())
        .then((json) => {
          this.setState({
            showNewPinModal: false,
            submitting: false,
            pin: '',
            invalid: {}
          });
          if (this.validateNewPin(json)) {
            const text = {'text': 'successful change pin'};
            post('log-info', this.props.deviceToken, text)
              .then((response) => response.json())
              .then((responseJson) => {
              })
              .catch(() => {
                console.log('log error');
              });
            // Modal needs time to close, or it'll freeze on ios. Rn bug.
            setTimeout(() => {
              Alert.alert('Saved!', 'Your new pin is ready to use.');
            }, 300);
          }
        })
        .catch(() => {
          const text = {'text': 'Call failed: change pin'};
          post('log-info', this.props.deviceToken, text)
            .then((response) => response.json())
            .then((responseJson) => {
            })
            .catch(() => {
              console.log('log error');
            });
          Alert.alert('Error trying to change pin!');
          navigator.navigate('Home');
        });
    }
  }

  validateNewPin = (json) => {
    const text = {'text': 'Validate change pin'};
    post('log-info', this.props.deviceToken, text)
      .then((response) => response.json())
      .then((responseJson) => {
      })
      .catch(() => {
        console.log('log error');
      });
    if (json.invalid) {
      const text = {'text': 'Unsuccessful change pin'};
      post('log-info', this.props.deviceToken, text)
        .then((response) => response.json())
        .then((responseJson) => {
        })
        .catch(() => {
          console.log('log error');
        });
      this.setState({invalid: json.invalid, submitting: false});
      return false;
    } else {
      return true;
    }
  }

  handleRemoveCardClick = () => {
    Alert.alert('Remove Card',
      'Are you sure you want to remove this card? You\'ll need to activate ' +
      'a card before you can use your gift value.',
      [
        {text: 'Cancel', onPress: null},
        {text: 'Yes', onPress: this.removeCard}
      ]
    );
  }

  handleCloseModal = () => {
    this.setState({showNewPinModal: false, pin: '', invalid: {}});
  }

  render () {
    count++;
    if (count < 2) {
      const text = {'text': 'Ferly Card'};
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
    const {card, loaded} = this.props;
    const {
      assumedAbility,
      changingAbility,
      showNewPinModal,
      pin,
      submitting,
      passed
    } = this.state;

    if (!loaded || submitting) {
      return <Spinner />;
    }

    if (!card) {
      if (passed === 'false') {
        return <CardForm onPass={() => this.setState({passed: ''})} />;
      } else if (passed === 'true') {
        return <AwaitingCard onPass={() => this.setState({passed: 'false'})} />;
      } else {
        return <NewAddressForm onPass={() => this.setState({passed: 'true'})} />;
      }
    }

    const {suspended, expiration} = card;
    let abilityValue = !suspended;
    if (assumedAbility !== null) {
      abilityValue = assumedAbility;
    }

    const splitExpiration = expiration.split('-');

    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <View style={styles.cardContainer}>
          <ImageBackground style={styles.cardBackground} source={ferlyCard}>
            <Text
              allowFontScaling={false}
              style={styles.panText}>
              **** {card.pan_redacted.substring(12, 16)}
            </Text>
          </ImageBackground>
        </View>
        <ScrollView keyboardShouldPersistTaps='handled' style={styles.actionsContainer}>
          <View style={styles.actionRow}>
            <Ionicons
              name={abilityValue ? 'md-unlock' : 'md-lock'}
              color={Theme.darkBlue}
              size={width > 600 ? 28 : 26} />
            <Text
              allowFontScaling={false}
              style={{
                flex: 1, paddingLeft: 20, color: Theme.darkBlue, fontSize: width > 600 ? 18 : 14
              }}>
              {abilityValue ? 'Enabled' : 'Disabled'}
            </Text>
            <Switch
              value={abilityValue}
              onValueChange={this.changeAbility}
              disabled={changingAbility} />
          </View>
          <TouchableOpacity
            onPress={this.handleExpirationClick}
            style={styles.actionRow}>
            <Ionicons name="md-calendar" color={Theme.darkBlue} size={width > 600 ? 26 : 24} />
            <View style={{flex: 1, paddingLeft: 20}}>
              <Text
                allowFontScaling={false}
                style={{color: Theme.darkBlue, fontSize: width > 600 ? 16 : 12}}>
                Expiration Date
              </Text>
              <Text
                allowFontScaling={false}
                style={{color: Theme.darkBlue, fontSize: width > 600 ? 16 : 12}}>
                {`${splitExpiration[1]}/${splitExpiration[0]}`}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.setState({showNewPinModal: true})}
            style={styles.actionRow}>
            <Ionicons name="md-keypad" color={Theme.darkBlue} size={width > 600 ? 28 : 26} />
            <Text
              allowFontScaling={false}
              style={{
                flex: 1, paddingLeft: 20, color: Theme.darkBlue, fontSize: width > 600 ? 18 : 14
              }}>
              Change PIN
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this.handleRemoveCardClick}
            style={styles.actionRow}>
            <Ionicons name="md-trash" color={Theme.darkBlue} size={width > 600 ? 28 : 26} />
            <Text
              allowFontScaling={false}
              style={{
                flex: 1, paddingLeft: 20, color: Theme.darkBlue, fontSize: width > 600 ? 18 : 14
              }}>
              Remove Card
            </Text>
          </TouchableOpacity>
          <Modal
            transparent={true}
            presentationStyle="overFullScreen"
            visible={showNewPinModal}
            onRequestClose={this.handleCloseModal}>
            <View style={styles.modalPage}>
              <View style={styles.modalDialog}>
                <Text
                  allowFontScaling={false}
                  style={{color: Theme.darkBlue, fontSize: width > 600 ? 24 : 22}}>
                  Enter a new PIN
                </Text>
                <View>
                  <Text
                    allowFontScaling={false}
                    style={styles.labelText}>PIN</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      allowFontScaling={false}
                      underlineColorAndroid='transparent'
                      keyboardType='numeric'
                      maxLength={4}
                      autoFocus
                      editable={!submitting}
                      returnKeyType='done'
                      onChangeText={(text) => {
                        text = text.replace(/\D/g, '');
                        this.setState({pin: text});
                      }}
                      value={pin} />
                  </View>
                  <Text
                    allowFontScaling={false}
                    style={styles.errorText}>{this.state.pinError}</Text>
                </View>
                <View style={{flexDirection: 'row-reverse'}}>
                  <TouchableOpacity
                    style={{paddingVertical: 5, paddingHorizontal: 8}}
                    disabled={submitting}
                    onPress={this.submitNewPin}>
                    <Text
                      allowFontScaling={false}
                      style={{color: Theme.lightBlue}}>SUBMIT</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{paddingVertical: 5, paddingHorizontal: 8}}
                    disabled={submitting}
                    onPress={this.handleCloseModal}>
                    <Text
                      allowFontScaling={false}
                      style={{color: Theme.lightBlue}}>CANCEL</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </ScrollView>
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
  cardBackground: {
    height: width > 600 ? 230 : 190,
    width: width > 600 ? 360 : 300,
    flexDirection: 'row-reverse'
  },
  panText: {fontSize: width > 600 ? 24 : 20, padding: 20, color: 'white'},
  inputContainer: {borderBottomWidth: 1, borderColor: 'gray'},
  title: {fontSize: width > 600 ? 26 : 22, fontWeight: 'bold', color: Theme.darkBlue},
  errorText: {color: 'red'},
  labelText: {color: 'gray'},
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
    height: width > 600 ? 180 : 160,
    width: width > 600 ? 280 : 260,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10
  }
});

FerlyCard.propTypes = {
  navigation: PropTypes.object.isRequired,
  deviceToken: PropTypes.string,
  onPass: PropTypes.func,
  card: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
  loaded: PropTypes.bool.isRequired
};

function mapStateToProps (state) {
  const apiStore = state.api.apiStore;
  const {deviceToken} = state.settings;
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

export default connect(mapStateToProps)(FerlyCard);
