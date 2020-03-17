import accounting from 'ferly/utils/accounting';
import PropTypes from 'prop-types';
import React from 'react';
import Avatar from 'ferly/components/Avatar';
import Theme from 'ferly/utils/theme';
import Spinner from 'ferly/components/Spinner';
import Icon from 'react-native-vector-icons/EvilIcons';
import {apiRequire, apiRefresh} from 'ferly/store/api';
import {connect} from 'react-redux';
import {createUrl, post, urls} from 'ferly/utils/fetch';
import {
  Alert,
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import {format as formatDate} from 'date-fns';

export class Transfer extends React.Component {
  static navigationOptions = ({navigation}) => ({
    title: `${navigation.state.params.title}`
  });

  constructor () {
    super();
    this.state = {
      click: false,
      submitting: false,
      theDate: false
    };
  }

  componentDidMount () {
    this.props.dispatch(apiRequire(this.props.transferUrl));
  }

  confirmTakeBack () {
    const {transferDetails} = this.props;
    this.setState({submitting: true});
    const takeBackParams = {
      transfer_id: transferDetails.id
    };
    post('retract', this.props.deviceToken, takeBackParams)
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({submitting: false});
        const text = {'text': 'successful retract'};
        post('log-info', this.props.deviceToken, text)
          .then((response) => response.json())
          .then((responseJson) => {
          })
          .catch(() => {
            console.log('log error');
          });
        if (responseJson.error || responseJson.invalid) {
          const text = {'text': 'Unsuccessful retract'};
          post('log-info', this.props.deviceToken, text)
            .then((response) => response.json())
            .then((responseJson) => {
            })
            .catch(() => {
              console.log('log error');
            });
          Alert.alert('Error!', 'Error trying to retract gift invite.');
        } else {
          Alert.alert('Success!', 'You have successfully retracted the invite with cash.');
        }
        this.props.dispatch(apiRefresh(urls.history));
        setTimeout(() => {
          this.props.dispatch(apiRefresh(urls.profile));
        }, 300);
        this.props.navigation.navigate('History');
      })
      .catch(() => {
        const text = {'text': 'Call failed: retract'};
        post('log-info', this.props.deviceToken, text)
          .then((response) => response.json())
          .then((responseJson) => {
          })
          .catch(() => {
            console.log('log error');
          });
        Alert.alert('Error trying to retract invite!');
      });
  }

  takeBack () {
    const {transferDetails} = this.props;
    const {counter_party: counterParty} = transferDetails;
    const buttons = [
      {text: 'Cancel', onPress: null, style: 'cancel'},
      {text: 'Yes', onPress: () => this.confirmTakeBack()}
    ];
    Alert.alert('Are you sure?', `Click yes to take back the gift you sent to ` +
    `${counterParty}.`, buttons);
  }

  remind () {
    const {transferDetails} = this.props;
    this.setState({submitting: true});
    const remindParams = {
      transfer_id: transferDetails.id
    };
    const {counter_party: counterParty} = transferDetails;
    post('get_transfer_details', this.props.deviceToken, remindParams)
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.error || responseJson.invalid) {
          const text = {'text': 'Unsuccessful get transfer details'};
          post('log-info', this.props.deviceToken, text)
            .then((response) => response.json())
            .then((responseJson) => {
            })
            .catch(() => {
              console.log('log error');
            });
        }
        this.setState({submitting: false});
        const text = {'text': 'successful get transfer details'};
        post('log-info', this.props.deviceToken, text)
          .then((response) => response.json())
          .then((responseJson) => {
          })
          .catch(() => {
            console.log('log error');
          });
        if (responseJson.sent_count < 3) {
          post('resend', this.props.deviceToken, remindParams)
            .then((response) => response.json())
            .then((responseJson) => {
              if (responseJson.error || responseJson.invalid) {
                const text = {'text': 'Unsuccessful resend'};
                post('log-info', this.props.deviceToken, text)
                  .then((response) => response.json())
                  .then((responseJson) => {
                  })
                  .catch(() => {
                    console.log('log error');
                  });
              }
              const text = {'text': 'successful resend'};
              post('log-info', this.props.deviceToken, text)
                .then((response) => response.json())
                .then((responseJson) => {
                })
                .catch(() => {
                  console.log('log error');
                });
              Alert.alert('Reminder Sent!', `We sent a reminder about your gift to ` +
        `${counterParty}.`);
            })
            .catch(() => {
              const text = {'text': 'Call failed: resend'};
              post('log-info', this.props.deviceToken, text)
                .then((response) => response.json())
                .then((responseJson) => {
                })
                .catch(() => {
                  console.log('log error');
                });
              Alert.alert('Error trying to send reminder!');
              this.props.navigation.navigate('Wallet');
            });
        } else {
          Alert.alert(`No Reminders Left`,
            `Reminder not sent. You've sent the max number of reminders`);
        }
      })
      .catch(() => {
        const text = {'text': 'Call failed: get transfer details'};
        post('log-info', this.props.deviceToken, text)
          .then((response) => response.json())
          .then((responseJson) => {
          })
          .catch(() => {
            console.log('log error');
          });
        Alert.alert('Error trying to send reminder!');
        this.props.navigation.navigate('Wallet');
      });
  }

  render () {
    const {submitting} = this.state;
    if (submitting) {
      return <Spinner />;
    }
    count++;
    if (count < 2) {
      const text = {'text': 'Transfer'};
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
    const {transferDetails} = this.props;
    const {
      expiration,
      name,
      amount,
      reason,
      message,
      timestamp,
      card_acceptor: cardAcceptor,
      pan_redacted: panNumber,
      available_amount: availableAmount,
      design_title: designTitle,
      counter_party: counterParty,
      counter_party_profile_image_url: counterPartyProfileImageUrl,
      transfer_type: transferType,
      convenience_fee: convenienceFee = 0,
      cc_last4: lastFour = '****',
      cc_brand: lowerBrand = ''
    } = transferDetails;
    let expireDate = '';
    let expiringDate = '';
    if (expiration) {
      expiration.forEach(item => {
        if (item.name && item.name === 'alarm.expire_invitation') {
          if (item.timestamp) {
            expireDate = item.timestamp;
          }
        }
      });
    } else if (transferType === 'pending') {
      return <Spinner />;
    }

    const total = parseFloat(amount) + parseFloat(convenienceFee);
    const brand = lowerBrand.charAt(0).toUpperCase() + lowerBrand.substring(1);
    const b = timestamp.split(/\D+/);
    if (expireDate) {
      const e = expireDate.split(/\D+/);
      const expire = new Date(Date.UTC(e[0], --e[1], e[2], e[3], e[4], e[5]));
      expiringDate = formatDate(expire, 'MMM D, YYYY h:mm A');
    }
    const date = new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5]));
    // React Native doesn't fully support Date.toLocaleString() on Android
    // use date-fns. Expect the JavaScriptCore to be updated in SDK 31.
    const dateDisplay = formatDate(date, 'MMM D, YYYY h:mm A');
    let verb = '';
    let cp = '';
    let sender = '';
    let messageTitle = '';
    let symbol = '';
    if (name) {
      switch (transferType) {
        case 'purchase':
          verb = 'added';
          symbol = '+';
          cp = ' to your account';
          sender = 'You';
          break;
        case 'pending':
          verb = 'gifted';
          symbol = '-';
          cp = ` to ${name}`;
          sender = 'You';
          break;
        case 'send':
          verb = 'gifted';
          symbol = '-';
          cp = ` to ${name}`;
          messageTitle = 'Your ';
          sender = 'You';
          break;
        case 'canceled':
          verb = 'canceled';
          symbol = <Icon
            name="refresh"
            color={Theme.darkBlue}
            size={width < 330 ? 30 : 35 && width > 600 ? 40 : 35} />;
          cp = ` to ${name}`;
          sender = 'You';
          break;
        case 'receive':
          verb = 'received';
          symbol = '+';
          cp = ` from ${counterParty}`;
          messageTitle = 'Their ';
          sender = 'You';
          break;
        case 'redeem':
          verb = 'spent';
          symbol = '-';
          break;
        case 'expired':
          verb = 'Expired Gift';
          symbol = '';
          cp = ` to ${name}`;
          sender = 'You';
          break;
      }
    } else {
      switch (transferType) {
        case 'purchase':
          verb = 'added';
          symbol = '+';
          cp = ' to your account';
          sender = 'You';
          break;
        case 'pending':
          verb = 'gifted';
          symbol = '-';
          cp = ` to ${counterParty}`;
          sender = 'You';
          break;
        case 'send':
          verb = 'gifted';
          symbol = '-';
          cp = ` to ${counterParty}`;
          messageTitle = 'Your ';
          sender = 'You';
          break;
        case 'canceled':
          verb = 'canceled';
          symbol = <Icon
            name="refresh"
            color={Theme.darkBlue}
            size={width < 330 ? 30 : 35 && width > 600 ? 40 : 35} />;
          cp = ` to ${counterParty}`;
          sender = 'You';
          break;
        case 'receive':
          verb = 'received';
          symbol = '+';
          cp = ` from ${counterParty}`;
          messageTitle = 'Their ';
          sender = 'You';
          break;
        case 'redeem':
          verb = 'spent';
          symbol = '-';
          sender = 'You';
          break;
        case 'expired':
          verb = 'Expired Gift';
          symbol = '';
          cp = ` to ${counterParty}`;
          sender = 'Your';
          break;
      }
    }
    let errorMessage = 'An attempt to use your Ferly Card was unsuccessful.';
    let errorReason = '';
    let errorFix = '';
    switch (reason) {
      case 'denied_externally':
        errorReason = 'The payment was denied by the merchant or card network.';
        errorFix = `Next time make sure you have enough ${designTitle} value and ask the cashier ` +
        `for a split payment if needed.`;
        break;
      case 'card_suspended':
        errorReason = 'The Ferly Card used is suspended.';
        errorFix = 'Go to the Ferly Card page in the menu to make sure its not suspended.';
        break;
      case 'card_holder_not_found':
        errorReason = 'The Ferly Card used is not linked to a Wallet.';
        errorFix = 'In the app go to the Ferly Card page in the Menu to add the card to your wallet.';
        break;
      case 'merchant_not_found':
        errorReason = 'The Ferly Card was used at a non-participating merchant.';
        errorFix = 'Check the Shop to find participating merchants.';
        break;
      case 'preauth_not_allowed':
        errorReason = 'The Merchant does not allow pre-authorized transactions.';
        break;
      case 'transaction_type_not_supported':
        errorReason = 'The Transaction type is not supported.';
        errorFix = 'Make sure to run the card as debit and use your pin.';
        break;
      case 'cash_back_not_supported':
        errorReason = 'Cash back is not supported.';
        errorFix = 'You cannot get cash back from Ferly.';
        break;
      case 'no_funds':
        errorReason = `Total amount charged was ${amount} but you held no ${designTitle} value.`;
        errorFix = `Next time buy ${designTitle} value before using you Ferly Card.`;
        break;
      case 'insufficient_funds':
        errorReason = `The amount charged was ${amount} but you held only ${availableAmount} in ` +
        `${designTitle} value.`;
        errorFix = `Next time tell the cashier to charge ${availableAmount} to your Ferly Card ` +
        `and use another payment method for the remaining amount.`;
        break;
      case 'reversal_original_not_found':
        errorReason = 'Original transfer could not be found.';
        errorFix = '';
        break;
      case 'reversal_system_error':
        errorReason = 'Internal error while reversing the transfer.';
        errorFix = '';
        break;
    }
    let locationName;
    if (cardAcceptor && cardAcceptor.location_name) {
      locationName = cardAcceptor.location_name;
    }
    let counterPartyAvatar;
    if (transferType === 'send' || transferType === 'receive') {
      counterPartyAvatar = (
        <View style={{marginTop: 5, zIndex: -1}}>
          <Avatar
            size={width > 600 ? 55 : 50}
            firstWord={counterParty}
            pictureUrl={counterPartyProfileImageUrl} />
        </View>
      );
    }
    let messageSection;
    if (message) {
      messageSection = (
        <View style={styles.section}>
          <View style={{borderBottomColor: Theme.lightBlue, borderBottomWidth: 1}}>
            <Text style={styles.sectionHeader}>
              {`${messageTitle}Message`}
            </Text>
          </View>
          <Text style={{fontSize: width > 600 ? 18 : 16, paddingLeft: 20, color: Theme.darkBlue}}>
            {message}
          </Text>
        </View>
      );
    } else if (
      transferType === 'receive' ||
      transferType === 'send' ||
      transferType === 'pending' ||
      transferType === 'canceled') {
      messageSection = (
        <View style={styles.section}>
          <View style={{borderBottomColor: Theme.lightBlue, borderBottomWidth: 1, paddingTop: 10}}>
            <Text style={styles.sectionHeader}>
              {`${messageTitle}Message`}
            </Text>
          </View>
          <Text style={{
            fontSize: width > 600 ? 18 : 16,
            paddingLeft: 20,
            color: Theme.darkBlue,
            paddingBottom: 20,
            paddingTop: 10
          }}>
            {'No message included.'}
          </Text>
        </View>
      );
    }
    let giftValue;
    let theReason;
    let cardLocationDetails;
    let recipient;
    let received;
    let status;
    let purchaseDetailsSection;
    let termsSection;
    let paymentSection;
    let feesSection;
    if (reason) {
      theReason = (
        <View style={styles.section} >
          <View style={{borderBottomColor: Theme.lightBlue, borderBottomWidth: 1}}>
            <Text style={styles.sectionHeader} >Error Reason</Text>
          </View>
          <View style={{paddingLeft: 20}} >
            <Text style={[styles.sectionText, {paddingBottom: 0, fontSize: width > 600 ? 18 : 16}]}>
              {errorReason}
            </Text>
            <Text style={[styles.sectionText, {fontSize: width > 600 ? 18 : 16}]} >
              {errorFix}
            </Text>
          </View>
        </View>
      );
      giftValue = (
        <View style={styles.section} >
          <View style={{borderBottomColor: Theme.lightBlue, borderBottomWidth: 1}}>
            <Text style={styles.sectionHeader} >Merchant</Text>
          </View>
          <View style={{paddingLeft: 20}} >
            <Text style={[styles.sectionText, {fontSize: width > 600 ? 18 : 16}]} >
              {designTitle}
            </Text>
          </View>
        </View>
      );
      cardLocationDetails = (
        <View style={styles.section} >
          <View style={{borderBottomColor: Theme.lightBlue, borderBottomWidth: 1}}>
            <Text style={styles.sectionHeader} >Details</Text>
          </View>
          <View style={{paddingLeft: 20, flexDirection: 'row'}} >
            <Text style={[styles.sectionText, {
              fontSize: width > 600 ? 18 : 16,
              paddingBottom: 0,
              justifyContent: 'flex-start'
            }]} >
              Ferly Card
            </Text>
            <Text style={[styles.sectionText, {
              fontSize: width > 600 ? 18 : 16,
              paddingBottom: 0,
              justifyContent: 'flex-end'
            }]} >
              {panNumber}
            </Text>
          </View>
          <View style={{paddingLeft: 20, flexDirection: 'row'}} >
            <Text style={[styles.sectionText, {
              fontSize: width > 600 ? 18 : 16,
              justifyContent: 'flex-start'
            }]} >
              Location
            </Text>
            <Text style={[styles.sectionText, {
              fontSize: width > 600 ? 18 : 16,
              justifyContent: 'flex-end'
            }]} >
              {locationName}
            </Text>
          </View>
        </View>
      );
    } else if (transferType === 'purchase') {
      termsSection = (
        <View style={styles.section}>
          <View style={{borderBottomColor: Theme.lightBlue, borderBottomWidth: 1}}>
            <Text style={styles.sectionHeader}>Rewards</Text>
          </View>
          <View style={{paddingLeft: 20, paddingBottom: 20, paddingTop: 10}}>
          </View>
        </View>
      );
      purchaseDetailsSection = (
        <View style={styles.section}>
          <View style={{borderBottomColor: Theme.lightBlue, borderBottomWidth: 1}}>
            <Text style={styles.sectionHeader}>Purchase Summary</Text>
          </View>
          <View style={{paddingHorizontal: 20, paddingVertical: 15}}>
            <View style={{borderWidth: 1, borderColor: Theme.lightBlue, borderRadius: 5}}>
              <View style={{
                paddingBottom: 5,
                borderBottomWidth: 1,
                borderBottomColor: Theme.lightBlue,
                paddingHorizontal: 15}}>
                <View style={[styles.functionRow]}>
                  <Text style={[styles.sectionText, {paddingTop: 10, paddingBottom: 5}]}>
                    {designTitle}
                  </Text>
                  <Text style={[styles.sectionText, {
                    color: Theme.darkBlue,
                    paddingBottom: 5,
                    paddingTop: 10,
                    paddingRight: 0
                  }]}>
                    ${amount}
                  </Text>
                </View>
                <Text style={{fontSize: 12, color: Theme.darkBlue}}>
                  Qualify for 5% loyalty
                </Text>
              </View>
              <View style={{paddingHorizontal: 20, paddingTop: 10}}>
                <View style={styles.functionRow}>
                  <Text style={[styles.sectionText, {paddingTop: 0, paddingBottom: 0}]}>
                    Online Fee
                  </Text>
                  <Text style={[styles.sectionText, {
                    color: Theme.darkBlue,
                    paddingBottom: 0,
                    paddingTop: 0,
                    paddingRight: 0
                  }]}>
                    {accounting.formatMoney(convenienceFee)}
                  </Text>
                </View>
                <View style={[styles.functionRow]}>
                  <Text style={[styles.sectionText, {paddingTop: 5, paddingBottom: 5}]}>
                    Taxes
                  </Text>
                  <Text style={[styles.sectionText, {
                    color: Theme.darkBlue,
                    paddingBottom: 5,
                    paddingTop: 5,
                    paddingRight: 0
                  }]}>
                    $0.00
                  </Text>
                </View>
              </View>
              <View style={[styles.functionRow, {backgroundColor: '#ABE0E0'}]}>
                <Text style={[styles.sectionText, {
                  paddingTop: 15,
                  paddingBottom: 15,
                  paddingHorizontal: 20,
                  fontWeight: 'bold'
                }]}>
                  Total Purchase
                </Text>
                <Text style={[styles.sectionText, {
                  color: Theme.darkBlue,
                  paddingBottom: 15,
                  paddingTop: 15,
                  paddingRight: 20,
                  fontWeight: 'bold'
                }]}>
                  {accounting.formatMoney(total)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      );
      paymentSection = (
        <View style={styles.section}>
          <View style={{borderBottomColor: Theme.lightBlue, borderBottomWidth: 1}}>
            <Text style={styles.sectionHeader}>Payment Method</Text>
          </View>
          <View style={[styles.functionRow, {paddingLeft: 20}]}>
            <Text style={styles.sectionText}>{brand} Card</Text>
            <Text style={[styles.sectionText, {color: Theme.darkBlue}]}>
              ************{lastFour}
            </Text>
          </View>
        </View>
      );
      const d = new Date(date);
      d.setDate(d.getDate(d) + 1825);
      const expirationDate = formatDate(d, 'MMM D, YYYY');
      feesSection = (
        <View style={styles.section}>
          <View style={{borderBottomColor: Theme.lightBlue, borderBottomWidth: 1}}>
            <Text style={styles.sectionHeader}>Expiration & Fees</Text>
          </View>
          <View style={[styles.functionRow, {paddingLeft: 20}]}>
            <Text style={[styles.sectionText, {paddingTop: 10, paddingBottom: 0}]}>
              Expiration Date
            </Text>
            <Text style={[styles.sectionText, {
              color: Theme.darkBlue,
              paddingBottom: 0,
              paddingTop: 10
            }]}>
              {expirationDate}
            </Text>
          </View>
          <View style={[styles.functionRow, {paddingLeft: 20}]}>
            <Text style={[styles.sectionText, {paddingTop: 0, paddingBottom: 0}]}>
              Inactivity Fee
            </Text>
            <Text style={[styles.sectionText, {
              color: Theme.darkBlue,
              paddingBottom: 0,
              paddingTop: 0
            }]}>
              None
            </Text>
          </View>
          <View style={[styles.functionRow, {paddingLeft: 20}]}>
            <Text style={[styles.sectionText, {paddingTop: 0, paddingBottom: 20}]}>
              Service Fee
            </Text>
            <Text style={[styles.sectionText, {
              color: Theme.darkBlue,
              paddingBottom: 20,
              paddingTop: 0
            }]}>
              None
            </Text>
          </View>
        </View>

      );
    } else if (transferType === 'send') {
      giftValue = (
        <View style={styles.section} >
          <View style={{borderBottomColor: Theme.lightBlue, borderBottomWidth: 1}}>
            <Text style={styles.sectionHeader} >Gift Value</Text>
          </View>
          <View style={{paddingLeft: 20}} >
            <Text style={[styles.sectionText, {fontSize: width > 600 ? 18 : 16}]} >
              {designTitle}
            </Text>
          </View>
        </View>
      );
      recipient = (
        <View style={styles.section} >
          <View style={{borderBottomColor: Theme.lightBlue, borderBottomWidth: 1}}>
            <Text style={styles.sectionHeader} >
              Recipient
            </Text>
          </View>
          <View style={{
            paddingLeft: 15,
            flexDirection: 'row',
            paddingBottom: 20,
            paddingTop: 10
          }} >
            {counterPartyAvatar}
            <Text style={{
              alignSelf: 'center',
              paddingLeft: 10,
              color: Theme.darkBlue,
              fontSize: width > 600 ? 18 : 16
            }} >
              {!name ? counterParty : name}
            </Text>
          </View>
        </View>
      );
    } else if (transferType === 'canceled') {
      giftValue = (
        <View style={styles.section} >
          <View style={{borderBottomColor: Theme.lightBlue, borderBottomWidth: 1}}>
            <Text style={styles.sectionHeader} >Gift Value</Text>
          </View>
          <View style={{paddingLeft: 20}} >
            <Text style={[styles.sectionText, {fontSize: width > 600 ? 18 : 16}]} >
              {designTitle}
            </Text>
          </View>
        </View>
      );
      recipient = (
        <View style={styles.section} >
          <View style={{borderBottomColor: Theme.lightBlue, borderBottomWidth: 1}}>
            <Text style={styles.sectionHeader} >
              Recipient
            </Text>
          </View>
          <View style={{paddingLeft: 15, flexDirection: 'column'}} >
            {counterPartyAvatar}
            <Text style={{
              alignSelf: 'flex-start',
              color: Theme.darkBlue,
              fontSize: width > 600 ? 18 : 16,
              paddingTop: 10
            }} >
              {!name ? counterParty : name}
            </Text>
            <Text style={{
              alignSelf: 'flex-start',
              color: Theme.darkBlue,
              fontSize: width > 600 ? 16 : 14
            }} >
              {!name ? null : counterParty}
            </Text>
          </View>
        </View>
      );
    } else if (transferType === 'expired') {
      giftValue = (
        <View style={styles.section} >
          <View style={{borderBottomColor: Theme.lightBlue, borderBottomWidth: 1}}>
            <Text style={styles.sectionHeader} >Gift Value</Text>
          </View>
          <View style={{paddingLeft: 20}} >
            <Text style={[styles.sectionText, {fontSize: width > 600 ? 18 : 16}]} >
              {designTitle}
            </Text>
          </View>
        </View>
      );
      recipient = (
        <View style={styles.section} >
          <View style={{borderBottomColor: Theme.lightBlue, borderBottomWidth: 1}}>
            <Text style={styles.sectionHeader} >
              Recipient
            </Text>
          </View>
          <View style={{paddingLeft: 15, flexDirection: 'column'}} >
            {counterPartyAvatar}
            <Text style={{
              alignSelf: 'flex-start',
              color: Theme.darkBlue,
              fontSize: width > 600 ? 18 : 16,
              paddingTop: 10
            }} >
              {!name ? counterParty : name}
            </Text>
            <Text style={{
              alignSelf: 'flex-start',
              color: Theme.darkBlue,
              fontSize: width > 600 ? 16 : 14
            }} >
              {!name ? null : counterParty}
            </Text>
          </View>
        </View>
      );
    } else if (transferType === 'pending') {
      giftValue = (
        <View style={styles.section} >
          <View style={{borderBottomColor: Theme.lightBlue, borderBottomWidth: 1}}>
            <Text style={styles.sectionHeader} >Gift Value</Text>
          </View>
          <View style={{paddingLeft: 20}} >
            <Text style={[styles.sectionText, {fontSize: width > 600 ? 18 : 16}]} >
              {designTitle}
            </Text>
          </View>
        </View>
      );
      recipient = (
        <View style={styles.section} >
          <View style={{borderBottomColor: Theme.lightBlue, borderBottomWidth: 1}}>
            <Text style={styles.sectionHeader} >
              Recipient
            </Text>
          </View>
          <View style={{paddingLeft: 15, flexDirection: 'column', paddingBottom: 10}} >
            {counterPartyAvatar}
            <Text style={{
              alignSelf: 'flex-start',
              color: Theme.darkBlue,
              fontSize: width > 600 ? 18 : 16,
              paddingTop: 10
            }} >
              {!name ? counterParty : name}
            </Text>
            <Text style={{
              alignSelf: 'flex-start',
              color: Theme.darkBlue,
              fontSize: width > 600 ? 16 : 14
            }} >
              {!name ? null : counterParty}
            </Text>
          </View>
        </View>
      );
      const giftDate = new Date(date);
      giftDate.setDate(giftDate.getDate() + 30);
      const giftExpiration = formatDate(giftDate, 'MMM D, YYYY');
      status = (
        <View style={styles.section} >
          <View style={{borderBottomColor: Theme.lightBlue, borderBottomWidth: 1}}>
            <Text style={styles.sectionHeader} >
              Status
            </Text>
          </View>
          <View style={{paddingLeft: 15, flexDirection: 'column'}} >
            <Text style={{
              paddingHorizontal: 10,
              color: Theme.darkBlue,
              fontSize: 16,
              paddingTop: 10,
              paddingBottom: 5
            }} >
              {!name ? counterParty : name} hasnt accepted your gift yet.
            </Text>
            <Text style={{
              paddingLeft: 10,
              paddingBottom: 15,
              color: Theme.darkBlue,
              fontSize: 16
            }} >
              The gift expires {!expiringDate ? giftExpiration : expiringDate}.
            </Text>
            <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
              <TouchableOpacity
                onPress={() => this.remind()}
                style={{backgroundColor: Theme.lightBlue, borderRadius: 5}}
              >
                <Text style={{fontSize: 16, paddingHorizontal: 34, paddingVertical: 8}}>
                  Remind
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => this.takeBack()}
                style={{backgroundColor: Theme.lightBlue, borderRadius: 5}}
              >
                <Text style={{fontSize: 16, paddingHorizontal: 25, paddingVertical: 8}}>
                  Take Back
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    } else if (transferType === 'receive') {
      giftValue = (
        <View style={styles.section} >
          <View style={{borderBottomColor: Theme.lightBlue, borderBottomWidth: 1}}>
            <Text style={styles.sectionHeader} >Gift Value</Text>
          </View>
          <View style={{paddingLeft: 20}} >
            <Text style={[styles.sectionText, {fontSize: width > 600 ? 18 : 16}]} >
              {designTitle}
            </Text>
          </View>
        </View>
      );
      received = (
        <View style={styles.section} >
          <View style={{borderBottomColor: Theme.lightBlue, borderBottomWidth: 1}}>
            <Text style={styles.sectionHeader} >Received From</Text>
          </View>
          <View style={{paddingLeft: 15, flexDirection: 'row', paddingTop: 10, paddingBottom: 20}} >
            {counterPartyAvatar}
            <Text style={{
              alignSelf: 'center',
              paddingLeft: 10,
              color: Theme.darkBlue,
              fontSize: 16
            }} >
              {counterParty}
            </Text>
          </View>
        </View>
      );
      const d = new Date(date);
      d.setDate(d.getDate(d) + 1825);
      const expirationDate = formatDate(d, 'MMM D, YYYY');
      feesSection = (
        <View style={styles.section}>
          <View style={{borderBottomColor: Theme.lightBlue, borderBottomWidth: 1}}>
            <Text style={styles.sectionHeader}>Expiration & Fees</Text>
          </View>
          <View style={[styles.functionRow, {paddingLeft: 20}]}>
            <Text style={[styles.sectionText, {paddingBottom: 0}]}>Expiration Date</Text>
            <Text style={[styles.sectionText, {color: Theme.darkBlue, paddingBottom: 0}]}>
              {expirationDate}
            </Text>
          </View>
          <View style={[styles.functionRow, {paddingLeft: 20}]}>
            <Text style={[styles.sectionText, {paddingTop: 5, paddingBottom: 0}]}>
              Inactivity Fee
            </Text>
            <Text style={[styles.sectionText, {
              color: Theme.darkBlue,
              paddingTop: 5,
              paddingBottom: 0
            }]}>
              None
            </Text>
          </View>
          <View style={[styles.functionRow, {paddingLeft: 20}]}>
            <Text style={[styles.sectionText, {paddingTop: 5}]}>Service Fee</Text>
            <Text style={[styles.sectionText, {color: Theme.darkBlue, paddingTop: 5}]}>
              None
            </Text>
          </View>
        </View>
      );
    } else if (transferType === 'redeem') {
      giftValue = (
        <View style={styles.section} >
          <View style={{borderBottomColor: Theme.lightBlue, borderBottomWidth: 1}}>
            <Text style={styles.sectionHeader} >Merchant</Text>
          </View>
          <View style={{paddingLeft: 20}} >
            <Text style={[styles.sectionText, {fontSize: width > 600 ? 18 : 16}]} >
              {designTitle}
            </Text>
          </View>
        </View>
      );
      cardLocationDetails = (
        <View style={styles.section} >
          <View style={{borderBottomColor: Theme.lightBlue, borderBottomWidth: 1}}>
            <Text style={styles.sectionHeader} >Details</Text>
          </View>
          <View style={{paddingLeft: 20, flexDirection: 'row'}} >
            <Text style={[styles.sectionText, {
              fontSize: width > 600 ? 18 : 16,
              paddingBottom: 0,
              justifyContent: 'flex-start'
            }]} >
              Ferly Card
            </Text>
            <Text style={[styles.sectionText, {
              fontSize: width > 600 ? 18 : 16,
              paddingBottom: 0,
              justifyContent: 'flex-end'
            }]} >
              {panNumber}
            </Text>
          </View>
          <View style={{paddingLeft: 20, flexDirection: 'row'}} >
            <Text style={[styles.sectionText, {
              fontSize: width > 600 ? 18 : 16,
              justifyContent: 'flex-start'
            }]} >
              Location
            </Text>
            <Text style={[styles.sectionText, {
              fontSize: width > 600 ? 18 : 16,
              justifyContent: 'flex-end'
            }]} >
              {locationName}
            </Text>
          </View>
        </View>
      );
    }
    return (
      <ScrollView keyboardShouldPersistTaps='handled' style={{backgroundColor: 'white'}}>
        <View>
          <View style={{
            alignItems: 'center',
            flexDirection: 'row',
            height: width < 330 ? 85 : 110 && width > 600 ? 135 : 110,
            justifyContent: 'center',
            paddingTop: 10
          }}>
            <Text style={{
              color: Theme.darkBlue, fontSize: width < 330 ? 30 : 35 && width > 600 ? 40 : 35
            }}>
              {symbol}${amount}
            </Text>
          </View>
          <View style={{
            alignItems: 'center',
            marginHorizontal: 20,
            paddingBottom: 10
          }}>
            <Text style={{
              textAlign: 'center',
              fontSize: width < 330 ? 16 : 18 && width > 600 ? 20 : 18,
              color: Theme.darkBlue
            }}>
              {reason ? `${errorMessage}` : `${sender} ${verb} ${designTitle}${cp}.`}
            </Text>
            <Text style={[styles.sectionText, {
              paddingTop: 5,
              paddingBottom: 30,
              fontSize: width < 330 ? 12 : 14 && width > 600 ? 16 : 14
            }]}>
              {dateDisplay}
            </Text>
            <View style={styles.spacer} />
          </View>
        </View>
        {theReason}
        {giftValue}
        {recipient}
        {cardLocationDetails}
        {received}
        {status}
        {termsSection}
        {messageSection}
        {purchaseDetailsSection}
        {paymentSection}
        {feesSection}
      </ScrollView>
    );
  }
}

let count = 0;
let {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  functionRow: {flexDirection: 'row', justifyContent: 'space-between'},
  section: {},
  sectionHeader: {
    fontSize: width > 600 ? 22 : 18,
    color: Theme.darkBlue,
    paddingBottom: 5,
    paddingHorizontal: 15
  },
  sectionText: {
    color: Theme.darkBlue,
    fontSize: width > 600 ? 20 : 16,
    paddingBottom: 20,
    paddingTop: 10,
    paddingRight: 15
  }
});

Transfer.propTypes = {
  dispatch: PropTypes.func.isRequired,
  transferDetails: PropTypes.object.isRequired,
  transferUrl: PropTypes.string.isRequired,
  navigation: PropTypes.object.isRequired,
  deviceToken: PropTypes.string.isRequired
};

function mapStateToProps (state, ownProps) {
  const {deviceToken} = state.settings;
  const transfer = ownProps.navigation.state.params;
  const transferUrl = createUrl('transfer', {transfer_id: transfer.id});
  const apiStore = state.api.apiStore;
  const details = apiStore[transferUrl] || {};
  const transferDetails = {...transfer, ...details};
  return {
    transferDetails,
    transferUrl,
    deviceToken
  };
}

export default connect(mapStateToProps)(Transfer);
