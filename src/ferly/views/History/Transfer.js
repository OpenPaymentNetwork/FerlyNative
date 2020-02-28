import accounting from 'ferly/utils/accounting';
import PropTypes from 'prop-types';
import React from 'react';
import Avatar from 'ferly/components/Avatar';
import Theme from 'ferly/utils/theme';
import Spinner from 'ferly/components/Spinner';
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
      submitting: false
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
      amount,
      message,
      timestamp,
      design_title: designTitle,
      counter_party: counterParty,
      counter_party_profile_image_url: counterPartyProfileImageUrl,
      transfer_type: transferType,
      convenience_fee: convenienceFee = 0,
      cc_last4: lastFour = '****',
      cc_brand: lowerBrand = ''
    } = transferDetails;
    const total = parseFloat(amount) + parseFloat(convenienceFee);
    const brand = lowerBrand.charAt(0).toUpperCase() + lowerBrand.substring(1);
    const b = timestamp.split(/\D+/);
    const date = new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5]));
    // React Native doesn't fully support Date.toLocaleString() on Android
    // use date-fns. Expect the JavaScriptCore to be updated in SDK 31.
    const dateDisplay = formatDate(date, 'MMM D, YYYY h:mm A');

    let verb = '';
    let cp = '';
    let messageTitle = '';
    let symbol = '';
    switch (transferType) {
      case 'purchase':
        verb = 'added';
        symbol = '+';
        cp = ' to your account';
        break;
      case 'pending':
        verb = 'gifted';
        symbol = '-';
        cp = ` to ${counterParty}`;
        break;
      case 'send':
        verb = 'gifted';
        symbol = '-';
        cp = ` to ${counterParty}`;
        messageTitle = 'Your ';
        break;
      case 'canceled':
        verb = 'canceled';
        symbol = '+';
        cp = ` to ${counterParty}`;
        break;
      case 'receive':
        verb = 'received';
        symbol = '+';
        cp = ` from ${counterParty}`;
        messageTitle = 'Their ';
        break;
      case 'redeem':
        verb = 'paid';
        symbol = '-';
        break;
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
    let recipient;
    let received;
    let status;
    let purchaseDetailsSection;
    let termsSection;
    let paymentSection;
    let feesSection;
    if (transferType === 'purchase') {
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
              {counterParty}
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
          <View style={{paddingLeft: 15, flexDirection: 'row'}} >
            {counterPartyAvatar}
            <Text style={{
              alignSelf: 'center',
              paddingLeft: 10,
              color: Theme.darkBlue,
              fontSize: width > 600 ? 18 : 16,
              paddingBottom: 10,
              paddingTop: 10
            }} >
              {counterParty}
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
          <View style={{paddingLeft: 15, flexDirection: 'row'}} >
            {counterPartyAvatar}
            <Text style={{
              alignSelf: 'center',
              paddingLeft: 10,
              color: Theme.darkBlue,
              fontSize: width > 600 ? 18 : 16,
              paddingBottom: 20,
              paddingTop: 10
            }} >
              {counterParty}
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
              paddingLeft: 10,
              color: Theme.darkBlue,
              fontSize: 16,
              paddingTop: 10,
              paddingBottom: 5
            }} >
              {counterParty} hasnt accepted your gift yet.
            </Text>
            <Text style={{
              paddingLeft: 10,
              paddingBottom: 15,
              color: Theme.darkBlue,
              fontSize: 16
            }} >
              The gift expires {giftExpiration}.
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
            <Text style={[styles.sectionText, {color: Theme.lightBlue, paddingBottom: 0}]}>
              {expirationDate}
            </Text>
          </View>
          <View style={[styles.functionRow, {paddingLeft: 20}]}>
            <Text style={[styles.sectionText, {paddingTop: 5, paddingBottom: 0}]}>
              Inactivity Fee
            </Text>
            <Text style={[styles.sectionText, {
              color: Theme.lightBlue,
              paddingTop: 5,
              paddingBottom: 0
            }]}>
              None
            </Text>
          </View>
          <View style={[styles.functionRow, {paddingLeft: 20}]}>
            <Text style={[styles.sectionText, {paddingTop: 5}]}>Service Fee</Text>
            <Text style={[styles.sectionText, {color: Theme.lightBlue, paddingTop: 5}]}>
              None
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
              {`You ${verb} ${designTitle}${cp}.`}
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
        {giftValue}
        {recipient}
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
