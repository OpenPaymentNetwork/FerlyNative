import accounting from 'ferly/utils/accounting';
import PropTypes from 'prop-types';
import React from 'react';
import Avatar from 'ferly/components/Avatar';
import Theme from 'ferly/utils/theme';
import {apiRequire, apiRefresh} from 'ferly/store/api';
import {connect} from 'react-redux';
import {createUrl, post, urls} from 'ferly/utils/fetch';
import {Alert, View, Text, ScrollView, StyleSheet, TouchableOpacity} from 'react-native';
import {format as formatDate} from 'date-fns';

export class Transfer extends React.Component {
  static navigationOptions = ({navigation}) => ({
    title: `${navigation.state.params.title}`
  });

  constructor () {
    super();
    this.state = {
      click: false
    };
  }

  componentDidMount () {
    this.props.dispatch(apiRequire(this.props.transferUrl));
  }

  confirmTakeBack () {
    const {transferDetails} = this.props;
    const takeBackParams = {
      transfer_id: transferDetails.id
    };
    post('retract', this.props.deviceToken, takeBackParams)
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.error || responseJson.invalid) {
          Alert.alert('Error!', 'Error trying to retract gift invite.');
        } else {
          Alert.alert('Success!', 'You have successfully retracted the cash with invite.');
        }
        this.props.dispatch(apiRefresh(urls.history));
        setTimeout(() => {
          this.props.dispatch(apiRefresh(urls.profile));
        }, 300);
        this.props.navigation.navigate('History');
      })
      .catch(() => {
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
    const remindParams = {
      transfer_id: transferDetails.id
    };
    const {counter_party: counterParty} = transferDetails;
    post('get_transfer_details', this.props.deviceToken, remindParams)
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.sent_count < 3) {
          post('resend', this.props.deviceToken, remindParams)
            .then((response) => response.json())
            .then((responseJson) => {
              Alert.alert('Reminder Sent!', `We sent a reminder about your gift to ` +
        `${counterParty}.`);
            })
            .catch(() => {
              Alert.alert('Error trying to send reminder!');
              this.props.navigation.navigate('Wallet');
            });
        } else {
          Alert.alert(`No Reminders Left`,
            `Reminder not sent. You've sent the max number of reminders`);
        }
      })
      .catch(() => {
        Alert.alert('Error trying to send reminder!');
        this.props.navigation.navigate('Wallet');
      });
  }

  render () {
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
            size={50}
            firstWord={counterParty}
            pictureUrl={counterPartyProfileImageUrl} />
        </View>
      );
    }
    let messageSection;
    if (message) {
      messageSection = (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>
            {`${messageTitle}Message`}
          </Text>
          <Text style={{fontSize: 16, paddingLeft: 20, color: 'darkgray'}}>
            {message}
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
      purchaseDetailsSection = (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Details</Text>
          <View style={{paddingLeft: 20}}>
            <View style={styles.functionRow}>
              <Text style={styles.sectionText}>Purchase Amount</Text>
              <Text style={[styles.sectionText, {color: Theme.lightBlue}]}>
                ${amount}
              </Text>
            </View>
            <View style={styles.functionRow}>
              <Text style={styles.sectionText}>Convenience Fee</Text>
              <Text style={[styles.sectionText, {color: Theme.lightBlue}]}>
                {accounting.formatMoney(convenienceFee)}
              </Text>
            </View>
            <View style={[
              styles.functionRow,
              {borderBottomWidth: 0.5, borderColor: 'darkgray'}
            ]}>
              <Text style={styles.sectionText}>Tax</Text>
              <Text style={[styles.sectionText, {color: Theme.lightBlue}]}>
                $0.00
              </Text>
            </View>
            <View style={styles.functionRow}>
              <Text style={styles.sectionText}>Total</Text>
              <Text style={[styles.sectionText, {color: Theme.lightBlue}]}>
                {accounting.formatMoney(total)}
              </Text>
            </View>
          </View>
        </View>
      );
      termsSection = (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Terms</Text>
          <View style={{paddingLeft: 20}}>
            <Text style={styles.sectionText}>
              The payment for your purchase was processed by Ferly, Inc. 481
              E 1000 S, STE B, Pleasant Grove, UT 84062.
            </Text>
            <View style={{height: 8}} />
            <Text style={styles.sectionText}>
              {'The purchase of this gift value is subject to the Ferly ' +
                'Cardholder and App Agreement and Ferly\'s ' +
               'Privacy Policy and Refund Policy.'}
            </Text>
            <View style={{height: 8}} />
            <Text style={styles.sectionText}>
              {'Please call Ferly, Inc. at (800) 651-2186 Monday through ' +
              'Friday from 9:00 am - 5:00 pm MST, or email ' +
              'support@ferly.com.'}
            </Text>
          </View>
        </View>
      );
      paymentSection = (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Payment Method</Text>
          <View style={[styles.functionRow, {paddingLeft: 20}]}>
            <Text style={styles.sectionText}>{brand} Card</Text>
            <Text style={[styles.sectionText, {color: Theme.lightBlue}]}>
              ************{lastFour}
            </Text>
          </View>
        </View>
      );
      const d = new Date();
      d.setDate(d.getDate() + 1825);
      const expirationDate = formatDate(d, 'MMM D, YYYY');
      feesSection = (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Expiration & Fees</Text>
          <View style={[styles.functionRow, {paddingLeft: 20}]}>
            <Text style={styles.sectionText}>Expiration Date</Text>
            <Text style={[styles.sectionText, {color: Theme.lightBlue}]}>
              {expirationDate}
            </Text>
          </View>
          <View style={[styles.functionRow, {paddingLeft: 20}]}>
            <Text style={styles.sectionText}>Dormancy/Inactivity Fee</Text>
            <Text style={[styles.sectionText, {color: Theme.lightBlue}]}>
              None
            </Text>
          </View>
          <View style={[styles.functionRow, {paddingLeft: 20}]}>
            <Text style={styles.sectionText}>Service Fee</Text>
            <Text style={[styles.sectionText, {color: Theme.lightBlue}]}>
              None
            </Text>
          </View>
        </View>

      );
    } else if (transferType === 'send') {
      giftValue = (
        <View style={styles.section} >
          <View>
            <Text style={styles.sectionHeader} >Gift Value</Text>
          </View>
          <View style={{paddingLeft: 20}} >
            <Text style={[styles.sectionText, {fontSize: 16}]} >{designTitle}</Text>
          </View>
        </View>
      );
      recipient = (
        <View style={styles.section} >
          <View>
            <Text style={styles.sectionHeader} >
              Recipient
            </Text>
          </View>
          <View style={{paddingLeft: 15, flexDirection: 'row'}} >
            {counterPartyAvatar}
            <Text style={{alignSelf: 'center', paddingLeft: 10, color: 'darkgray', fontSize: 16}} >
              {counterParty}
            </Text>
          </View>
        </View>
      );
    } else if (transferType === 'canceled') {
      giftValue = (
        <View style={styles.section} >
          <View>
            <Text style={styles.sectionHeader} >Gift Value</Text>
          </View>
          <View style={{paddingLeft: 20}} >
            <Text style={[styles.sectionText, {fontSize: 16}]} >{designTitle}</Text>
          </View>
        </View>
      );
      recipient = (
        <View style={styles.section} >
          <View>
            <Text style={styles.sectionHeader} >
              Recipient
            </Text>
          </View>
          <View style={{paddingLeft: 15, flexDirection: 'row'}} >
            {counterPartyAvatar}
            <Text style={{alignSelf: 'center', paddingLeft: 10, color: 'darkgray', fontSize: 16}} >
              {counterParty}
            </Text>
          </View>
        </View>
      );
    } else if (transferType === 'pending') {
      giftValue = (
        <View style={styles.section} >
          <View>
            <Text style={styles.sectionHeader} >Gift Value</Text>
          </View>
          <View style={{paddingLeft: 20}} >
            <Text style={[styles.sectionText, {fontSize: 16}]} >{designTitle}</Text>
          </View>
        </View>
      );
      recipient = (
        <View style={styles.section} >
          <View>
            <Text style={styles.sectionHeader} >
              Recipient
            </Text>
          </View>
          <View style={{paddingLeft: 15, flexDirection: 'row'}} >
            {counterPartyAvatar}
            <Text style={{alignSelf: 'center', paddingLeft: 10, color: 'darkgray', fontSize: 16}} >
              {counterParty}
            </Text>
          </View>
        </View>
      );
      const giftDate = new Date();
      giftDate.setDate(giftDate.getDate() + 30);
      const giftExpiration = formatDate(giftDate, 'MMM D, YYYY');
      status = (
        <View style={styles.section} >
          <View>
            <Text style={styles.sectionHeader} >
              Status
            </Text>
          </View>
          <View style={{paddingLeft: 15, flexDirection: 'column'}} >
            <Text style={{paddingLeft: 10, color: 'darkgray', fontSize: 16}} >
              {counterParty} hasnt accepted your gift yet.
            </Text>
            <Text style={{paddingLeft: 10, paddingBottom: 15, color: 'darkgray', fontSize: 16}} >
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
                style={{backgroundColor: '#cfdde2', borderRadius: 5}}
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
          <View>
            <Text style={styles.sectionHeader} >Gift Value</Text>
          </View>
          <View style={{paddingLeft: 20}} >
            <Text style={[styles.sectionText, {fontSize: 16}]} >{designTitle}</Text>
          </View>
        </View>
      );
      received = (
        <View style={styles.section} >
          <View>
            <Text style={styles.sectionHeader} >Received From</Text>
          </View>
          <View style={{paddingLeft: 15, flexDirection: 'row'}} >
            {counterPartyAvatar}
            <Text style={{alignSelf: 'center', paddingLeft: 10, color: 'darkgray', fontSize: 16}} >
              {counterParty}
            </Text>
          </View>
        </View>
      );
      const d = new Date();
      d.setDate(d.getDate() + 1825);
      const expirationDate = formatDate(d, 'MMM D, YYYY');
      feesSection = (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Expiration & Fees</Text>
          <View style={[styles.functionRow, {paddingLeft: 20}]}>
            <Text style={styles.sectionText}>Expiration Date</Text>
            <Text style={[styles.sectionText, {color: Theme.lightBlue}]}>
              {expirationDate}
            </Text>
          </View>
          <View style={[styles.functionRow, {paddingLeft: 20}]}>
            <Text style={styles.sectionText}>Dormancy/Inactivity Fee</Text>
            <Text style={[styles.sectionText, {color: Theme.lightBlue}]}>
              None
            </Text>
          </View>
          <View style={[styles.functionRow, {paddingLeft: 20}]}>
            <Text style={styles.sectionText}>Service Fee</Text>
            <Text style={[styles.sectionText, {color: Theme.lightBlue}]}>
              None
            </Text>
          </View>
        </View>
      );
    }
    return (
      <ScrollView style={{backgroundColor: 'white'}}>
        <View style={{backgroundColor: Theme.darkBlue}} >
          <View style={{
            alignItems: 'center',
            flexDirection: 'row',
            height: 110,
            justifyContent: 'center',
            paddingTop: 10
          }}>
            <Text style={{color: Theme.lightBlue, fontSize: 35}}>
              {symbol}${amount}
            </Text>
          </View>
          <View style={{
            alignItems: 'center',
            marginHorizontal: 20,
            paddingBottom: 10
          }}>
            <Text style={{textAlign: 'center', fontSize: 18, color: 'white'}}>
              {`You ${verb} ${designTitle}${cp}.`}
            </Text>
            <Text style={[styles.sectionText, {paddingTop: 5, paddingBottom: 30}]}>
              {dateDisplay}
            </Text>
            <View style={styles.spacer} />
          </View>
        </View>
        {giftValue}
        {recipient}
        {received}
        {status}
        {messageSection}
        {purchaseDetailsSection}
        {paymentSection}
        {feesSection}
        {termsSection}
      </ScrollView>
    );
  }
}

let count = 0;

const styles = StyleSheet.create({
  functionRow: {flexDirection: 'row', justifyContent: 'space-between'},
  section: {paddingHorizontal: 20, padding: 15},
  sectionHeader: {fontSize: 18},
  sectionText: {color: 'darkgray', fontSize: 14}
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
