import accounting from 'ferly/utils/accounting';
import PrimaryButton from 'ferly/components/PrimaryButton';
import PropTypes from 'prop-types';
import React from 'react';
import SimpleCurrencyInput from 'ferly/components/SimpleCurrencyInput';
import Spinner from 'ferly/components/Spinner';
import Theme from 'ferly/utils/theme';
import {apiExpire, apiRequire, apiRefresh} from 'ferly/store/api';
import {connect} from 'react-redux';
import {post, urls} from 'ferly/utils/fetch';
import {StackActions} from 'react-navigation';
import {
  AsyncStorage,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
  Dimensions
} from 'react-native';
import Constants from 'expo-constants';
const {releaseChannel} = Constants.manifest;

export class Give extends React.Component {
  static navigationOptions = {
    title: 'Give Gift'
  };

  constructor (props) {
    super(props);
    this.maxMessageLength = 400;
    this.state = {amount: 0, error: '', submitting: false, message: ''};
  }

  componentDidMount () {
    this.props.dispatch(apiRequire(urls.profile));
  }

  alertUser (customerFirstName, customerLastName, formatted, title, contact) {
    if (customerLastName && customerFirstName) {
      Alert.alert(
        'Complete!',
        `You gifted ${formatted} ${title} to ${customerFirstName} ${customerLastName}.`);
    } else if (customerFirstName) {
      Alert.alert(
        'Complete!',
        `You gifted ${formatted} ${title} to ${customerFirstName}.`);
    } else if (customerLastName) {
      Alert.alert(
        'Complete!',
        `You gifted ${formatted} ${title} to ${customerFirstName}.`);
    } else {
      Alert.alert(
        'Complete!',
        `You gifted ${formatted} ${title} to ${contact}.`);
    }
  }

  send () {
    const {navigation} = this.props;
    const params = navigation.state.params;
    const {design, customer, contact, name} = params;
    let customerFirstName = '';
    let customerLastName = '';
    let customerName = name;
    let id = '';
    let sender = '';
    const {title} = design;
    try {
      let {first_name: firstName, last_name: lastName} = customer;
      customerFirstName = firstName;
      customerLastName = lastName;
      id = customer.id.toString();
    } catch (error) {
      id = contact;
      if (contact.includes('@')) {
        id = 'email:' + id;
      } else {
        let country = false;
        if (id[0] === '+') {
          country = true;
        }
        id = id.replace(/\D/g, '');
        if (id.length === 10 && !country) {
          console.log('here2');
          id = 'phone:+1' + id.toString();
        } else {
          id = 'phone:+' + id.toString();
        }
      }
      sender = 'sending to new customer';
    }
    const {amount, message} = this.state;
    const formatted = accounting.formatMoney(parseFloat(amount));

    const postParams = {
      name: name,
      sender: sender,
      recipient_id: id,
      amount: amount,
      design_id: design.id.toString(),
      invitation_type: releaseChannel === 'production' ? 'code_private' : 'code_shared',
      invitation_code_length: '6',
      message: message
    };

    this.setState({submitting: true});
    post('send', this.props.deviceToken, postParams)
      .then((response) => response.json())
      .then((json) => {
        if (releaseChannel !== 'production') {
          if (json.transfer && json.transfer.invitation_code) {
            AsyncStorage.setItem('giftCode', json.transfer.invitation_code).then(() => {
            });
          }
        }
        if (!(json.error || json.invalid)) {
          const text = {'text': 'Successful send'};
          post('log-info', this.props.deviceToken, text)
            .then((response) => response.json())
            .then((responseJson) => {
            })
            .catch(() => {
              console.log('log error');
            });
          const resetAction = StackActions.reset({
            index: 0,
            actions: [StackActions.push({routeName: 'Home'})]
          });
          navigation.dispatch(resetAction);
          if (json.transfer && json.transfer.recipient_id) {
            let customerParams = {
              recipient_id: json.transfer.recipient_id
            };
            post('get-customer-name', this.props.deviceToken, customerParams)
              .then((response) => response.json())
              .then((json) => {
                if (json.error || json.invalid) {
                  const text = {'text': 'Unsuccessful get customer name give'};
                  post('log-info', this.props.deviceToken, text)
                    .then((response) => response.json())
                    .then((responseJson) => {
                    })
                    .catch(() => {
                      console.log('log error');
                    });
                }
                customerName = json.name || '';
                if (customerName) {
                  Alert.alert(
                    'Complete!',
                    `You gifted ${formatted} ${title} to ${customerName}.`);
                } else {
                  this.alertUser(customerFirstName, customerLastName, formatted, title, contact);
                  this.props.dispatch(apiExpire(urls.history));
                  this.props.dispatch(apiExpire(urls.profile));
                }
              })
              .catch(() => {
                const text = {'text': 'Call failed: get customer name'};
                post('log-info', this.props.deviceToken, text)
                  .then((response) => response.json())
                  .then((responseJson) => {
                  })
                  .catch(() => {
                    console.log('log error');
                  });
                navigation.navigate('Home');
              });

            this.props.dispatch(apiExpire(urls.history));
            this.props.dispatch(apiExpire(urls.profile));
          } else {
            this.alertUser(customerFirstName, customerLastName, formatted, title, contact);
            this.props.dispatch(apiExpire(urls.history));
            this.props.dispatch(apiExpire(urls.profile));
          }
        } else {
          const text = {'text': 'Unsuccessful send'};
          post('log-info', this.props.deviceToken, text)
            .then((response) => response.json())
            .then((responseJson) => {
            })
            .catch(() => {
              console.log('log error');
            });
          let invalid;
          if (json.invalid) {
            if (json.invalid.recipient_uid) {
              invalid = 'Invalid Recipient';
            } else if (json.invalid['amounts.0']) {
              invalid = json.invalid['amounts.0'];
            } else if (json.invalid.amount) {
              invalid = json.invalid['amount'];
            } else {
              invalid = 'Invalid Input';
            }
          } else if (json.error && (typeof (json.error) === 'string')) {
            invalid = json.error;
          } else {
            invalid = 'Unknown Error';
          }
          const error = invalid;
          this.setState({error: error, amount: 0, submitting: false});
        }
      })
      .catch(() => {
        const text = {'text': 'Error in send'};
        post('log-info', this.props.deviceToken, text)
          .then((response) => response.json())
          .then((responseJson) => {
          })
          .catch(() => {
            console.log('log error');
          });
        this.props.dispatch(apiRefresh(urls.profile));
        navigation.navigate('Home');
      });
  }

  onChange (newAmount) {
    this.setState({amount: newAmount});
  }

  details () {
    const params = this.props.navigation.state.params;
    const {name, contact, contactName} = params;
    if (!contact) {
      return (
        <View style={styles.recipientRow}>
          <Text style={{fontSize: width > 600 ? 24 : 20, fontWeight: 'bold'}}>Send</Text>
          <Text style={{fontSize: width > 600 ? 22 : 20, fontWeight: 'bold', paddingLeft: 40}}>
            {`${params.customer.first_name} ${params.customer.last_name}`}
          </Text>
        </View>
      );
    } else if (contactName) {
      if (contactName.firstName === undefined && contactName.firstName === undefined) {
        return (
          <View style={styles.recipientRow}>
            <Text style={{fontSize: width > 600 ? 24 : 20, fontWeight: 'bold'}}>Send</Text>
            <View style={{flexDirection: 'column'}}>
              <Text style={{fontSize: width > 600 ? 20 : 18, fontWeight: 'bold', paddingLeft: 40}}>
                {`${contact}`}
              </Text>
            </View>
          </View>
        );
      } else if (contactName.firstName === undefined) {
        return (
          <View style={styles.recipientRow}>
            <Text style={{fontSize: width > 600 ? 24 : 20, fontWeight: 'bold'}}>Send</Text>
            <View style={{flexDirection: 'column'}}>
              <Text style={{fontSize: width > 600 ? 20 : 18, fontWeight: 'bold', paddingLeft: 40}}>
                {`${contactName.lastName}`}
              </Text>
              <Text style={{fontSize: width > 600 ? 16 : 14, color: 'gray', paddingLeft: 40}}>
                {`${contact}`}
              </Text>
            </View>
          </View>
        );
      } else if (contactName.lastName === undefined) {
        return (
          <View style={styles.recipientRow}>
            <Text style={{fontSize: width > 600 ? 24 : 20, fontWeight: 'bold'}}>Send</Text>
            <View style={{flexDirection: 'column'}}>
              <Text style={{fontSize: width > 600 ? 20 : 18, fontWeight: 'bold', paddingLeft: 40}}>
                {`${contactName.firstName}`}
              </Text>
              <Text style={{fontSize: width > 600 ? 16 : 14, color: 'gray', paddingLeft: 40}}>
                {`${contact}`}
              </Text>
            </View>
          </View>
        );
      } else {
        return (
          <View style={styles.recipientRow}>
            <Text style={{fontSize: width > 600 ? 24 : 20, fontWeight: 'bold'}}>Send</Text>
            <View style={{flexDirection: 'column'}}>
              <Text style={{fontSize: width > 600 ? 20 : 18, fontWeight: 'bold', paddingLeft: 40}}>
                {`${contactName.firstName} ${contactName.lastName}`}
              </Text>
              <Text style={{fontSize: width > 600 ? 16 : 14, color: 'gray', paddingLeft: 40}}>
                {`${contact}`}
              </Text>
            </View>
          </View>
        );
      }
    } else {
      return (
        <View style={styles.recipientRow}>
          <Text style={{fontSize: 20, fontWeight: 'bold'}}>Send</Text>
          <View style={{flexDirection: 'column'}}>
            <Text style={{fontSize: 18, fontWeight: 'bold', paddingLeft: 40}}>
              {`${name}`}
            </Text>
            <Text style={{fontSize: 14, color: 'gray', paddingLeft: 40}}>
              {`${contact}`}
            </Text>
          </View>
        </View>
      );
    }
  }

  render () {
    count++;
    if (count < 2) {
      const text = {'text': 'Give'};
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
    const params = this.props.navigation.state.params;
    const {design} = params;
    const {amount, submitting, error, message} = this.state;
    const amounts = this.props.amounts || [];
    const fieldValue = accounting.formatMoney(parseFloat(amount));

    const found = amounts.find((cashRow) => {
      return cashRow.id === design.id;
    });

    const foundAmount = found ? found.amount : 0;
    const formatted = accounting.formatMoney(parseFloat(foundAmount));

    const counter = (
      <Text style={{color: 'lightgray'}}>
        {`${message.length}/${this.maxMessageLength}`}
      </Text>
    );

    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <View style={{flex: 1}}>
          {this.details()}
          <View style={styles.designRow}>
            <View style={{flexShrink: 1, paddingVertical: 14}}>
              <Text style={styles.designTitle}>{design.title}</Text>
              <Text style={{color: 'gray', fontSize: width > 600 ? 16 : 14}}>
                Available: {formatted}
              </Text>
            </View>
            <SimpleCurrencyInput
              onChangeText={this.onChange.bind(this)}
              error={error} />
          </View>
          <View style={{paddingHorizontal: 20}}>
            <Text style={styles.messageTitle}>
              Add a message
            </Text>
            <TouchableWithoutFeedback
              onPress={() => this.messageInput.focus()}>
              <View style={{borderWidth: 0.5, padding: 6, minHeight: width > 600 ? 150 : 100}}>
                <TextInput
                  ref={ref => (this.messageInput = ref)}
                  multiline
                  maxLength={this.maxMessageLength}
                  returnKeyType='done'
                  blurOnSubmit={true}
                  underlineColorAndroid={'transparent'}
                  onChangeText={(text) => this.setState({message: text})}
                  value={message} />
              </View>
            </TouchableWithoutFeedback>
            {message.length > this.maxMessageLength - 50 ? counter : null}
          </View>
          {submitting ? <Spinner /> : null}
        </View>
        <PrimaryButton
          title="Send Gift"
          disabled={fieldValue === '$0.00' || submitting}
          color={Theme.lightBlue}
          onPress={this.send.bind(this)}
        />
      </View>
    );
  }
}

let count = 0;
const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  recipientRow: {
    flexDirection: 'row',
    height: width > 600 ? 70 : 60,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderColor: 'black',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  designRow: {
    flexShrink: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between'
  },
  designTitle: {
    flexShrink: 1,
    flexWrap: 'wrap',
    paddingRight: 20,
    fontWeight: 'bold',
    fontSize: width > 600 ? 26 : 22
  },
  messageTitle: {fontSize: width > 600 ? 18 : 14, color: Theme.lightBlue, marginBottom: 8}
});

Give.propTypes = {
  dispatch: PropTypes.func.isRequired,
  email: PropTypes.string,
  phone: PropTypes.string,
  amounts: PropTypes.array,
  navigation: PropTypes.object.isRequired,
  deviceToken: PropTypes.string.isRequired
};

function mapStateToProps (state) {
  const {deviceToken} = state.settings;
  const apiStore = state.api.apiStore;
  const {amounts} = apiStore[urls.profile] || {};
  const myProfile = apiStore[urls.profile] || {};
  const {uids = []} = myProfile;
  let emails = [];
  let phones = [];
  uids.forEach((uid) => {
    const split = uid.split(':');
    if (split[0] === 'email') {
      emails.push(split[1]);
    } else if (split[0] === 'phone') {
      phones.push(split[1]);
    }
  });
  return {
    myProfile,
    email: emails[0],
    phone: phones[0],
    amounts,
    deviceToken
  };
}

export default connect(mapStateToProps)(Give);
