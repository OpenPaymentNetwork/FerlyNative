import accounting from 'ferly/utils/accounting';
import Icon from 'react-native-vector-icons/FontAwesome';
import I from 'react-native-vector-icons/MaterialCommunityIcons';
import Ico from 'react-native-vector-icons/Ionicons';
import PrimaryButton from 'ferly/components/PrimaryButton';
import PropTypes from 'prop-types';
import React from 'react';
import TestElement from 'ferly/components/TestElement';
import Theme from 'ferly/utils/theme';
import Spinner from 'ferly/components/Spinner';
import {StackActions} from 'react-navigation';
import {apiRequire, apiExpire, apiRefresh} from 'ferly/store/api';
import {connect} from 'react-redux';
import {createUrl, post, urls} from 'ferly/utils/fetch';
import { CheckBox } from 'react-native-elements';
import {
  KeyboardAvoidingView,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TextInput
} from 'react-native';

export class MarketCart extends React.Component {
  static navigationOptions = {
    title: 'Cart'
  };

  constructor (props) {
    super(props);
    this.state = {
      submitting: false,
      rewardsChecked: false,
      cashChecked: true,
      openLoop: false,
      error: false,
      invalid: '',
      loyaltyAmount: '',
      loopId: '',
      setRewardsAmount: '',
      setCashAmount: '',
      cashLoopId: '',
      rewardsLoopId: ''
    };
  }

  componentDidMount () {
    this.props.apiRequire(this.props.sourcesUrl);
    let cash = {};
    let rewards = {};
    Amounts.forEach(function (item) {
      if (item) {
        if (item.title === 'Ferly Cash') {
          cash = item;
        } else if (item.title === 'Ferly Rewards') {
          rewards = item;
        }
      }
    });
    if (!cash.amount) {
      this.setState({cashChecked: false});
    }
    if (!cash.title && !rewards.title) {
      Alert.alert('Sorry!', `You need to have Ferly Cash or Ferly Rewards value in your wallet ` +
      `before you can purchase gift values.`);
      this.props.navigation.navigate('Home');
    }
  }

  onSuccess () {
    const {navigation} = this.props;
    const params = navigation.state.params;
    const {design, amount} = params;
    let gettingLoyaltyAmount = '0.00';
    let gettingLoyaltyId = '';
    gettingLoyaltyAmount = (amount / 100 * 5);
    gettingLoyaltyAmount = gettingLoyaltyAmount.toFixed(2);
    let tradeParams = {};
    if (!this.state.cashChecked && this.state.rewardsChecked) {
      if (this.state.setRewardsAmount < amountNumber) {
        this.setState({
          invalid: `The amount you entered is less than $${amountNumber}`, submitting: false
        });
        return;
      } else if (amountNumber > rewards.amount) {
        this.setState({
          invalid: `You only have $${rewards.amount} Ferly Rewards available.`, submitting: false
        });
        return;
      } else if (amountNumber < this.state.setRewardsAmount) {
        this.setState({
          invalid: `The amount you entered is more than $${amountNumber}`, submitting: false
        });
        return;
      }
    } else if (this.state.cashChecked && !this.state.rewardsChecked) {
      if (amountNumber > cash.amount) {
        this.setState({
          invalid: `You only have $${cash.amount} Ferly Cash available.`, submitting: false
        });
        return;
      }
    } else if (this.state.cashChecked && this.state.rewardsChecked) {
      if (this.state.setRewardsAmount > amountNumber) {
        this.setState({
          invalid: `The amount you entered is more than $${amountNumber}`, submitting: false
        });
        return;
      } else if (parseFloat(cash.amount) + parseFloat(this.state.setRewardsAmount) < amountNumber) {
        this.setState({
          invalid: `The total amount you entered is less than $${amountNumber}`, submitting: false
        });
        return;
      } else if (parseFloat(cash.amount) + parseFloat(this.state.setRewardsAmount) >
      parseFloat(cash.amount) + parseFloat(rewards.amount)) {
        this.setState({invalid: `You have only $${cash.amount} Ferly Cash and $${rewards.amount}` +
        ` Rewards available.`,
        submitting: false});
        return;
      }
    }
    if (design.authorized_merchant) {
      post('list-loyalty-designs', this.props.deviceToken)
        .then((response) => response.json())
        .then((responseJson) => {
          responseJson.forEach(function (item) {
            let newTitle = item.title.replace(' Loyalty', '');
            if (design.title === newTitle) {
              gettingLoyaltyId = item.id;
            }
          });
          if (!this.state.cashChecked) {
            if (design.authorized_merchant) {
              tradeParams = {
                accept_expire_seconds: 30,
                combine_accept: true,
                open_loop: this.state.openLoop,
                amounts: [this.state.setRewardsAmount],
                expect_amounts: [amount, gettingLoyaltyAmount],
                expect_loop_ids: [design.id, gettingLoyaltyId],
                loop_ids: [this.state.rewardsLoopId]
              };
            } else {
              tradeParams = {
                accept_expire_seconds: 30,
                combine_accept: true,
                open_loop: this.state.openLoop,
                amounts: [this.state.setRewardsAmount],
                expect_amounts: [amount],
                expect_loop_ids: [design.id],
                loop_ids: [this.state.rewardsLoopId]
              };
            }
          } else if (!this.state.rewardsChecked) {
            if (design.authorized_merchant) {
              tradeParams = {
                accept_expire_seconds: 30,
                combine_accept: true,
                open_loop: this.state.openLoop,
                amounts: [amountNumber.toString()],
                expect_amounts: [amount, gettingLoyaltyAmount],
                expect_loop_ids: [design.id, gettingLoyaltyId],
                loop_ids: [cash.id.toString()]
              };
            } else {
              tradeParams = {
                accept_expire_seconds: 30,
                combine_accept: true,
                open_loop: this.state.openLoop,
                amounts: [amountNumber.toString()],
                expect_amounts: [amount],
                expect_loop_ids: [design.id],
                loop_ids: [cash.id.toString()]
              };
            }
          } else {
            if (this.state.setCashAmount === '0') {
              if (design.authorized_merchant) {
                tradeParams = {
                  accept_expire_seconds: 30,
                  combine_accept: true,
                  open_loop: this.state.openLoop,
                  amounts: [this.state.setRewardsAmount],
                  expect_amounts: [amount, gettingLoyaltyAmount],
                  expect_loop_ids: [design.id, gettingLoyaltyId],
                  loop_ids: [this.state.rewardsLoopId]
                };
              } else {
                tradeParams = {
                  accept_expire_seconds: 30,
                  combine_accept: true,
                  open_loop: this.state.openLoop,
                  amounts: [this.state.setRewardsAmount],
                  expect_amounts: [amount],
                  expect_loop_ids: [design.id],
                  loop_ids: [this.state.rewardsLoopId]
                };
              }
            } else {
              if (design.authorized_merchant) {
                tradeParams = {
                  accept_expire_seconds: 30,
                  combine_accept: true,
                  open_loop: this.state.openLoop,
                  amounts: [this.state.setCashAmount, this.state.setRewardsAmount],
                  expect_amounts: [amount, gettingLoyaltyAmount],
                  expect_loop_ids: [design.id, gettingLoyaltyId],
                  loop_ids: [cash.id.toString(), this.state.rewardsLoopId]
                };
              } else {
                tradeParams = {
                  accept_expire_seconds: 30,
                  combine_accept: true,
                  open_loop: this.state.openLoop,
                  amounts: [this.state.setCashAmount, this.state.setRewardsAmount],
                  expect_amounts: [amount],
                  expect_loop_ids: [design.id],
                  loop_ids: [cash.id.toString(), this.state.rewardsLoopId]
                };
              }
            }
          }
          this.setState({submitting: true});

          post('trade', this.props.deviceToken, tradeParams)
            .then((response) => response.json())
            .then((json) => {
              if (!json.invalid && !json.error) {
                const text = {'text': 'successful trade'};
                post('log-info', this.props.deviceToken, text)
                  .then((response) => response.json())
                  .then((responseJson) => {
                  })
                  .catch(() => {
                    console.log('log error');
                  });
                this.props.apiRefresh(urls.history);
                this.props.apiRefresh(urls.profile);
                const formatted = accounting.formatMoney(parseFloat(amount));
                const desc = `You added ${formatted} ${design.title} to your wallet.`;
                Alert.alert('Complete!', desc);
                this.props.apiExpire(this.props.sourcesUrl);
                const resetAction = StackActions.reset({
                  index: 0,
                  actions: [
                    StackActions.push({routeName: 'Market'})
                  ]
                });
                this.props.navigation.dispatch(resetAction);
                this.props.navigation.navigate('Home');
              } else {
                if (json.invalid && json.invalid['amounts.0']) {
                  this.setState({invalid: json.invalid['amounts.0'], submitting: false});
                } else if (json.invalid && json.invalid['amounts.1']) {
                  this.setState({invalid: json.invalid['amounts.1'], submitting: false});
                } else {
                  Alert.alert('Error!', 'Please check all info and try again!');
                  navigation.navigate('Home');
                }
                const text = {'text': 'Unsuccessful trade'};
                post('log-info', this.props.deviceToken, text)
                  .then((response) => response.json())
                  .then((responseJson) => {
                  })
                  .catch(() => {
                    console.log('log error');
                  });
              }
            })
            .catch(() => {
              Alert.alert('Error!', 'Please try again.');
              navigation.navigate('Home');
            });
        })
        .catch(() => {
          Alert.alert('Error!', 'Please try again.');
          navigation.navigate('Home');
        });
    } else {
      if (!this.state.cashChecked) {
        if (design.authorized_merchant) {
          tradeParams = {
            accept_expire_seconds: 30,
            combine_accept: true,
            open_loop: this.state.openLoop,
            amounts: [this.state.setRewardsAmount],
            expect_amounts: [amount, gettingLoyaltyAmount],
            expect_loop_ids: [design.id, gettingLoyaltyId],
            loop_ids: [this.state.rewardsLoopId]
          };
        } else {
          tradeParams = {
            accept_expire_seconds: 30,
            combine_accept: true,
            open_loop: this.state.openLoop,
            amounts: [this.state.setRewardsAmount],
            expect_amounts: [amount],
            expect_loop_ids: [design.id],
            loop_ids: [this.state.rewardsLoopId]
          };
        }
      } else if (!this.state.rewardsChecked) {
        if (design.authorized_merchant) {
          tradeParams = {
            accept_expire_seconds: 30,
            combine_accept: true,
            open_loop: this.state.openLoop,
            amounts: [amountNumber.toString()],
            expect_amounts: [amount, gettingLoyaltyAmount],
            expect_loop_ids: [design.id, gettingLoyaltyId],
            loop_ids: [cash.id.toString()]
          };
        } else {
          tradeParams = {
            accept_expire_seconds: 30,
            combine_accept: true,
            open_loop: this.state.openLoop,
            amounts: [amountNumber.toString()],
            expect_amounts: [amount],
            expect_loop_ids: [design.id],
            loop_ids: [cash.id.toString()]
          };
        }
      } else {
        if (this.state.setCashAmount === '0') {
          if (design.authorized_merchant) {
            tradeParams = {
              accept_expire_seconds: 30,
              combine_accept: true,
              open_loop: this.state.openLoop,
              amounts: [this.state.setRewardsAmount],
              expect_amounts: [amount, gettingLoyaltyAmount],
              expect_loop_ids: [design.id, gettingLoyaltyId],
              loop_ids: [this.state.rewardsLoopId]
            };
          } else {
            tradeParams = {
              accept_expire_seconds: 30,
              combine_accept: true,
              open_loop: this.state.openLoop,
              amounts: [this.state.setRewardsAmount],
              expect_amounts: [amount],
              expect_loop_ids: [design.id],
              loop_ids: [this.state.rewardsLoopId]
            };
          }
        } else {
          if (design.authorized_merchant) {
            tradeParams = {
              accept_expire_seconds: 30,
              combine_accept: true,
              open_loop: this.state.openLoop,
              amounts: [this.state.setCashAmount, this.state.setRewardsAmount],
              expect_amounts: [amount, gettingLoyaltyAmount],
              expect_loop_ids: [design.id, gettingLoyaltyId],
              loop_ids: [cash.id.toString(), this.state.rewardsLoopId]
            };
          } else {
            tradeParams = {
              accept_expire_seconds: 30,
              combine_accept: true,
              open_loop: this.state.openLoop,
              amounts: [this.state.setCashAmount, this.state.setRewardsAmount],
              expect_amounts: [amount],
              expect_loop_ids: [design.id],
              loop_ids: [cash.id.toString(), this.state.rewardsLoopId]
            };
          }
        }
      }
      this.setState({submitting: true});

      post('trade', this.props.deviceToken, tradeParams)
        .then((response) => response.json())
        .then((json) => {
          if (!json.invalid && !json.error) {
            const text = {'text': 'successful trade'};
            post('log-info', this.props.deviceToken, text)
              .then((response) => response.json())
              .then((responseJson) => {
              })
              .catch(() => {
                console.log('log error');
              });
            this.props.apiRefresh(urls.history);
            this.props.apiRefresh(urls.profile);
            const formatted = accounting.formatMoney(parseFloat(amount));
            const desc = `You added ${formatted} ${design.title} to your wallet.`;
            Alert.alert('Complete!', desc);
            this.props.apiExpire(this.props.sourcesUrl);
            const resetAction = StackActions.reset({
              index: 0,
              actions: [
                StackActions.push({routeName: 'Market'})
              ]
            });
            this.props.navigation.dispatch(resetAction);
            this.props.navigation.navigate('Home');
          } else {
            if (json.invalid && json.invalid['amounts.0']) {
              this.setState({invalid: json.invalid['amounts.0'], submitting: false});
            } else if (json.invalid && json.invalid['amounts.1']) {
              this.setState({invalid: json.invalid['amounts.1'], submitting: false});
            } else {
              Alert.alert('Error!', 'Please check all info and try again!');
              navigation.navigate('Home');
            }
            const text = {'text': 'Unsuccessful trade'};
            post('log-info', this.props.deviceToken, text)
              .then((response) => response.json())
              .then((responseJson) => {
              })
              .catch(() => {
                console.log('log error');
              });
            this.setState({submitting: false});
          }
        })
        .catch(() => {
          Alert.alert('Error!', 'Please check all info and try again!');
          navigation.navigate('Home');
        });
    }
  }

  handleSubmitClick () {
    this.onSuccess();
  }

  receiveMessage (event) {
    const data = event.nativeEvent.data;
    if (data.startsWith('paymenttoken:')) {
      const token = data.substring(data.indexOf(':') + 1);
      this.onSuccess(token);
    } else if (data === 'error') {
      this.setState({submitting: false});
    }
  }

  checkedRewards (rewards) {
    this.setState({invalid: ''});
    if (this.state.cashChecked) {
      let totalCashAmount = this.state.setCashAmount - this.state.setRewardsAmount;
      this.setState({setCashAmount: totalCashAmount.toString()});
    }
    this.setState({rewardsChecked: !this.state.rewardsChecked});
    this.setState({rewardsLoopId: rewards.id});
  }

  validateText (newAmount) {
    if (newAmount.match(/^\d*\.?\d*$/)) {
      if (newAmount.includes('.')) {
        let arr = newAmount.split('.');
        if (arr.length > 2) {
          return false;
        }
        let secondArr = arr[1];
        if (secondArr.includes('.')) {
          return false;
        } else if (secondArr.length > 2) {
          return false;
        } else {
          return true;
        }
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  rewardsText (text) {
    if (this.validateText(text)) {
      this.setState({setRewardsAmount: text, invalid: ''});
      if (text.match(/[^.\d]/)) {
        this.setState({invalid: `Only numbers and periods allowed.`});
      }
      if (text.includes('.')) {
        if (text.split('.').length > 2) {
          this.setState({invalid: `You entered more than one decimal.`});
          return;
        } else {
          let number = text.split('.')[1].length;
          if (number > 2) {
            this.setState({invalid: `You entered too many numbers after decimal.`});
            return;
          }
        }
      }
      if (this.state.cashChecked) {
        let totalCashAmount = amountNumber - text;
        this.setState({setCashAmount: totalCashAmount.toString()});
      } else {
        if (text > amountNumber) {
          this.setState({invalid: `The amount you entered is more than $${amountNumber}`});
        } else if (text === amountNumber) {
          this.setState({invalid: ''});
        }
      }
    } else {
      return null;
    }
  }

  checkedCash (cash) {
    this.setState({invalid: ''});
    if (this.state.rewardsChecked) {
      let totalCashAmount = amountNumber - this.state.setRewardsAmount;
      this.setState({setCashAmount: totalCashAmount.toString()});
    } else {
      this.setState({setCashAmount: amountNumber.toString()});
    }
    this.setState({cashChecked: !this.state.cashChecked});
    let cashId = cash.id.toString();
    this.setState({cashLoopId: cashId});
  }

  render () {
    count++;
    if (count < 2) {
      const text = {'text': 'Cart'};
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
    Amounts.forEach(function (item) {
      if (item) {
        if (item.title === 'Ferly Cash') {
          cash = item;
        } else if (item.title === 'Ferly Rewards') {
          rewards = item;
        }
      }
    });
    const {params} = this.props.navigation.state;
    const {amount: amountString, design} = params;
    const convenienceFee = parseFloat(design.fee);
    amountNumber = parseFloat(amountString);
    let rewardsAmount = (amountNumber / 100 * 5);
    rewardsAmount = rewardsAmount.toFixed(2);
    const total = amountNumber + convenienceFee;
    const {submitting, invalid, cashChecked, rewardsChecked} = this.state;
    const {title} = design;
    if (submitting) {
      return <Spinner />;
    }
    return (
      <View style={styles.page}>
        <KeyboardAvoidingView
          behavior='position'
          keyboardVerticalOffset={80}
          style={{flex: 1}}>
          <TestElement
            parent={ScrollView}
            label='test-id-cart-header-box'
            keyboardShouldPersistTaps='handled'>
            <View
              style={styles.header}>
              <View style={{alignItems: 'center'}} >
              </View>
              <View style={styles.designContainer}>
                <ScrollView>
                  <View style={{flexGrow: 1, flex: 1}}>
                    <View style={styles.section}>
                      <Text
                        allowFontScaling={false}
                        style={[styles.sectionHeader, {marginBottom: 15}]}>
                        Purchase Summary
                      </Text>
                      <View style={{
                        borderWidth: 2, borderRadius: 10, borderColor: Theme.lightBlue
                      }}>
                        <View style={{borderBottomWidth: 2, borderBottomColor: Theme.lightBlue}}>
                          <View style={[styles.functionRow]}>
                            <Text
                              allowFontScaling={false}
                              style={[styles.sectionText, {
                                marginTop: 15,
                                marginHorizontal: 10,
                                width: width > 350 ? width / 1.5 : width / 1.6
                              }]}>
                              {title}
                            </Text>
                            <Text
                              allowFontScaling={false}
                              style={[styles.sectionText,
                                {color: Theme.darkBlue, marginTop: 15, marginHorizontal: 10}]}>
                              {accounting.formatMoney(amountNumber)}
                            </Text>
                          </View>
                          <View style={{marginBottom: 10, marginHorizontal: 10}}>
                            <Text
                              allowFontScaling={false}
                              style={{fontSize: 12, color: Theme.darkBlue}}>
                              {design.authorized_merchant ? 'Qualifies for 5% loyalty' : null}
                            </Text>
                          </View>
                        </View>
                        <View style={[styles.functionRow, {marginTop: 10, marginHorizontal: 10}]}>
                          <Text
                            allowFontScaling={false}
                            style={[styles.sectionText, {fontSize: 12}]}>
                            Online Fee
                          </Text>
                          <Text
                            allowFontScaling={false}
                            style={[styles.sectionText,
                              {color: Theme.darkBlue, fontSize: 12}]}>
                            {accounting.formatMoney(convenienceFee)}
                          </Text>
                        </View>
                        <View style={[styles.functionRow, {
                          marginHorizontal: 10, marginVertical: 10
                        }]}>
                          <Text
                            allowFontScaling={false}
                            style={[styles.sectionText, {fontSize: 12}]}>
                            Taxes
                          </Text>
                          <Text
                            allowFontScaling={false}
                            style={[styles.sectionText,
                              {color: Theme.darkBlue, fontSize: 12}]}>
                            $0.00
                          </Text>
                        </View>
                        <View style={[styles.functionRow, {backgroundColor: Theme.lightBlue}]}>
                          <Text
                            allowFontScaling={false}
                            style={[styles.totalText, {margin: 10}]}>
                            Total
                          </Text>
                          <Text
                            allowFontScaling={false}
                            style={[styles.sectionText,
                              {
                                margin: 10,
                                color: Theme.darkBlue,
                                fontSize: width > 600 ? 18 : 16
                              }]}>
                            {accounting.formatMoney(total)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    {!design.authorized_merchant ? null
                      : <View style={{
                        justifyContent: 'center',
                        paddingTop: 10,
                        alignItems: 'center',
                        flexDirection: 'row'
                      }}>
                        <I
                          name="heart-box"
                          color={Theme.darkBlue}
                          size={width < 330 ? 20 : width > 600 ? 28 : 23}/>
                        <Text
                          allowFontScaling={false}
                          style={[styles.sectionHeader, {
                            fontSize: 14, paddingLeft: 5, marginTop: 0, marginBottom: 0
                          }]}>
                          {`You'll earn $${rewardsAmount} loyalty!`}
                        </Text>
                      </View>
                    }
                    <View style={{paddingHorizontal: 20, marginTop: 10, marginBottom: 5}}>
                      {!cash.amount ? null
                        : <View>
                          <Text
                            allowFontScaling={false}
                            style={styles.sectionHeader}>Payment Method</Text>
                          <View style={[styles.functionRow, {height: 30}]}>
                            <View style={[styles.sectionText,
                              {color: Theme.darkBlue,
                                marginVertical: 5,
                                flexDirection: 'row',
                                alignItems: 'center'
                              }]}>
                              <Icon name="dollar"
                                color={Theme.darkBlue}
                                size={width < 330 ? 18 : width > 600 ? 18 : 21}/>
                              <Text
                                allowFontScaling={false}
                                style={[styles.sectionText,
                                  {marginHorizontal: 15, fontWeight: 'bold', fontSize: 16}
                                ]}>
                                {cash.title}
                              </Text>
                            </View>
                            <View style={[styles.sectionText,
                              {
                                color: Theme.darkBlue,
                                marginHorizontal: 10,
                                height: 50,
                                marginTop: -11,
                                marginRight: -15
                              }]}>
                              <CheckBox
                                keyboardShouldPersistTaps='handled'
                                center
                                checkedColor={Theme.darkBlue}
                                checked={this.state.cashChecked}
                                onPress={() => this.checkedCash(cash)}
                              />
                            </View>
                          </View>
                          <View style={{marginBottom: 10, marginHorizontal: 25}}>
                            <Text
                              allowFontScaling={false}
                              style={{fontSize: 12, color: Theme.darkBlue}}>
                              {`Available: $${cash.amount}`}
                            </Text>
                          </View>
                        </View>
                      }
                      <View>
                        { !rewards.amount ? null
                          : <View style={[styles.functionRow, {height: 30, marginTop: 10}]}>
                            <View style={[styles.sectionText,
                              {color: Theme.darkBlue,
                                marginVertical: 5,
                                flexDirection: 'row',
                                alignItems: 'center'
                              }]}>
                              <Ico
                                name="md-ribbon"
                                color={Theme.darkBlue}
                                size={width < 330 ? 20 : width > 600 ? 23 : 23} />
                              <Text
                                allowFontScaling={false}
                                style={[styles.sectionText,
                                  {marginHorizontal: 10, fontWeight: 'bold', fontSize: 16}
                                ]}>
                                {!rewards ? null : rewards.title}
                              </Text>
                            </View>
                            <View style={[styles.sectionText,
                              {
                                color: Theme.darkBlue,
                                marginHorizontal: 10,
                                height: 50,
                                marginTop: -11,
                                marginRight: -15
                              }]}>
                              <CheckBox
                                keyboardShouldPersistTaps='handled'
                                center
                                checkedColor={Theme.darkBlue}
                                checked={this.state.rewardsChecked}
                                onPress={() => this.checkedRewards(rewards)}
                              />
                            </View>
                          </View>
                        }
                        { !rewards.amount ? null
                          : <View style={{marginBottom: 15, marginHorizontal: 25}}>
                            <Text
                              allowFontScaling={false}
                              style={{fontSize: 12, color: Theme.darkBlue}}>
                              {`Available: $${!rewards ? null : rewards.amount}`}
                            </Text>
                          </View>
                        }
                        { !rewards.amount ? null
                          : <View style={{marginLeft: 20}}>
                            {
                              !this.state.rewardsChecked ? null
                                : <TextInput
                                  allowFontScaling={false}
                                  keyboardShouldPersistTaps='handled'
                                  placeholder="Enter amount to use"
                                  style={styles.textField}
                                  returnKeyType='done'
                                  keyboardType='numeric'
                                  value={this.state.setRewardsAmount}
                                  autoFocus={true}
                                  maxLength={10}
                                  onChangeText={(text) => this.rewardsText(text)} />
                            }
                          </View>
                        }
                        {invalid ? (<Text
                          allowFontScaling={false}
                          style={styles.error}>{invalid}</Text>) : null}
                      </View>
                    </View>
                  </View>
                </ScrollView>
              </View>
            </View>
            <View style={{height: 80}} />
          </TestElement>
        </KeyboardAvoidingView>
        <PrimaryButton
          title="Confirm Purchase"
          disabled={
            submitting ||
            invalid !== '' ||
            (!cashChecked && !rewardsChecked) ||
            (rewardsChecked && this.state.setRewardsAmount === '')
          }
          onPress={this.onSuccess.bind(this)} />
      </View>
    );
  }
}

let count = 0;
const {width} = Dimensions.get('window');
let Amounts = [];
let cash = {};
let rewards = {};
let amountNumber;

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'white',
    justifyContent: 'center'
  },
  textField: {
    borderWidth: 2,
    borderColor: Theme.lightBlue,
    height: width > 600 ? 40 : 35,
    width: width / 1.5,
    borderRadius: 5,
    paddingLeft: 10,
    fontSize: width > 600 ? 18 : 14
  },
  page: {flex: 1, flexDirection: 'column', backgroundColor: 'white'},
  error: {
    fontSize: width > 600 ? 16 : 14,
    color: 'red'
  },
  functionRow: {flexDirection: 'row', justifyContent: 'space-between'},
  section: {paddingHorizontal: 20},
  sectionHeader: {fontSize: 16, marginTop: 10, marginBottom: 5, color: Theme.darkBlue},
  sectionText: {color: Theme.darkBlue, fontSize: width > 600 ? 18 : 16},
  totalText: {fontSize: width > 600 ? 18 : 16, fontWeight: 'bold', color: Theme.darkBlue}
});

MarketCart.propTypes = {
  card: PropTypes.object,
  amounts: PropTypes.array,
  apiExpire: PropTypes.func.isRequired,
  apiRefresh: PropTypes.func.isRequired,
  apiRequire: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  sources: PropTypes.array,
  sourcesUrl: PropTypes.string.isRequired,
  deviceToken: PropTypes.string.isRequired
};

function mapStateToProps (state) {
  const {deviceToken} = state.settings;
  const sourcesUrl = createUrl('list-stripe-sources');
  const apiStore = state.api.apiStore;
  const sourcesResponse = apiStore[sourcesUrl] || {};
  const {sources: sourcesList} = sourcesResponse;
  const {
    amounts,
    first_name: firstName,
    uids = []
  } = apiStore[urls.profile] || {};
  Amounts = amounts;
  let sources;
  if (sourcesList) {
    sources = sourcesList.map((source) => {
      const {id, brand, last_four: lastFour} = source;
      return {id, brand, lastFour};
    });
  }

  return {
    amounts,
    firstName,
    uids,
    sourcesUrl,
    sources,
    deviceToken
  };
}

const mapDispatchToProps = {
  apiExpire,
  apiRefresh,
  apiRequire
};

export default connect(mapStateToProps, mapDispatchToProps)(MarketCart);
