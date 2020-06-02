import accounting from 'ferly/utils/accounting';
import PropTypes from 'prop-types';
import React from 'react';
import Theme from 'ferly/utils/theme';
import TestElement from 'ferly/components/TestElement';
import Icons from 'react-native-vector-icons/EvilIcons';
import Icon from 'react-native-vector-icons/Feather';
import Ico from 'react-native-vector-icons/MaterialIcons';
import Spinner from 'ferly/components/Spinner';
import {connect} from 'react-redux';
import {apiRequire} from 'ferly/store/api';
import {post, urls} from 'ferly/utils/fetch';
import {format as formatDate} from 'date-fns';
import {
  Alert,
  Dimensions,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';

export class FerlyValue extends React.Component {
  static navigationOptions = {
    title: 'Ferly Value'
  };

  componentDidMount () {
    this.props.dispatch(apiRequire(urls.history));
    let cash = Amounts.find(o => o.title === 'Ferly Cash');
    let rewards = Amounts.find(o => o.title === 'Ferly Rewards');
    if (!cash && !rewards) {
      Alert.alert('Sorry!', 'You have no Ferly Cash or Ferly Rewards value.');
      this.props.navigation.navigate('Home');
    }
  }

  renderRow (key, column1, column2, column3, design) {
    let titleVerb = '';
    let symbol = '';
    if (design.transfer_type === 'trade') {
      if (design.trade_Designs_Received[1] === 'Ferly Rewards') {
        titleVerb = 'Reward';
        symbol = '+';
      } else {
        titleVerb = 'Purchase';
        symbol = '';
      }
    }
    switch (design.transfer_type) {
      case 'add':
        titleVerb = 'Add';
        symbol = '+';
        break;
      case 'send':
        titleVerb = 'Send Gift';
        symbol = '-';
        break;
      case 'pending':
        titleVerb = 'Pending Gift';
        symbol = '';
        break;
      case 'canceled':
        titleVerb = 'Canceled Gift';
        symbol = '';
        break;
      case 'receive':
        titleVerb = 'Receive Gift';
        symbol = '+';
        break;
      case 'redeem':
        titleVerb = 'Spend';
        symbol = '-';
        break;
      case 'purchase':
        titleVerb = 'Add';
        symbol = '+';
        break;
    }
    return (
      <TouchableOpacity
        onPress={() => this.props.navigation.navigate('Transfer', {design, title: titleVerb})}
        key={key}
        style={[styles.entry, {
          borderBottomWidth: 1,
          borderColor: Theme.darkBlue,
          height: width < 350 ? 40 : width > 600 ? 80 : 55
        }]}>
        <View style={{
          borderColor: 'white',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          width: width / 3
        }}>
          <Text
            allowFontScaling={false}
            style={{color: Theme.darkBlue, fontSize: width > 600 ? 18 : 14}}>
            {column1}
          </Text>
        </View>
        <View style={{
          borderColor: 'white',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          width: width / 3
        }}>
          <Text
            allowFontScaling={false}
            style={{color: Theme.darkBlue, fontSize: width > 600 ? 18 : 14}}>
            {column2}
          </Text>
        </View>
        <View style={{
          borderColor: 'white',
          justifyContent: 'flex-end',
          alignItems: 'flex-end',
          flexDirection: 'row',
          width: width / 3,
          paddingRight: 30
        }}>
          {symbol === ''
            ? <Icons
              name="refresh"
              color={Theme.darkBlue}
              size={width < 330 ? 20 : width > 600 ? 28 : 22} />
            : null
          }
          <Text
            allowFontScaling={false}
            style={{
              color: Theme.darkBlue, fontSize: width > 600 ? 18 : 14
            }}>
            {symbol}{column3}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  renderExpirationRow (key, column1, column2, column3) {
    return (
      <View
        key={key}
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-around',
          height: width < 350 ? 30 : width > 600 ? 40 : 35,
          alignItems: 'center',
          paddingHorizontal: 20,
          backgroundColor: 'white'
        }}
      >
        <View style={{
          borderColor: 'white',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          width: width / 3
        }}>
          <Text
            allowFontScaling={false}
            style={{
              color: Theme.darkBlue, fontSize: width > 600 ? 16 : 14
            }}>
            {column1}
          </Text>
        </View>
        <View style={{
          borderColor: 'white',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          width: width / 3
        }}>
          <Text
            allowFontScaling={false}
            style={{
              color: Theme.darkBlue, fontSize: width > 600 ? 16 : 14
            }}>
            {column2}
          </Text>
        </View>
        <View style={{
          borderColor: 'white',
          justifyContent: 'flex-end',
          alignItems: 'flex-start',
          flexDirection: 'row',
          width: width / 3
        }}>
          <Text
            allowFontScaling={false}
            style={{
              color: Theme.darkBlue, fontSize: width > 600 ? 16 : 14
            }}>
            {column3}
          </Text>
        </View>
      </View>
    );
  }

  getCashTitle (transferType) {
    let item = {};
    switch (transferType) {
      case 'purchase':
        item['cashTitle'] = 'Add';
        item['cashSymbol'] = '+';
        return item;
      case 'add':
        item['cashTitle'] = 'Add';
        item['cashSymbol'] = '+';
        return item;
      case 'send':
        item['cashTitle'] = 'Send Gift';
        item['cashSymbol'] = '-';
        return item;
      case 'pending':
        item['cashTitle'] = 'Pending Gift';
        item['cashSymbol'] = '-';
        return item;
      case 'canceled':
        item['cashTitle'] = 'Canceled Gift';
        item['cashSymbol'] = '';
        return item;
      case 'receive':
        item['cashTitle'] = 'Receive Gift';
        item['cashSymbol'] = '+';
        return item;
      case 'redeem':
        item['cashTitle'] = 'Spend';
        item['cashSymbol'] = '-';
        return item;
      case 'trade':
        item['cashTitle'] = 'Purchase';
        item['cashSymbol'] = '';
        return item;
      default:
        return item;
    }
  }

  getLoyalTitle (transferType) {
    let item = {};
    switch (transferType) {
      case 'purchase':
        item['rewardsTitle'] = 'Add';
        item['rewardsSymbol'] = '+';
        return item;
      case 'add':
        item['rewardsTitle'] = 'Add';
        item['rewardsSymbol'] = '+';
        return item;
      case 'send':
        item['rewardsTitle'] = 'Send Gift';
        item['rewardsSymbol'] = '-';
        return item;
      case 'pending':
        item['rewardsTitle'] = 'Pending Gift';
        item['rewardsSymbol'] = '-';
        return item;
      case 'canceled':
        item['rewardsTitle'] = 'Canceled Gift';
        item['rewardsSymbol'] = '';
        return item;
      case 'receive':
        item['rewardsTitle'] = 'Receive Gift';
        item['rewardsSymbol'] = '+';
        return item;
      case 'redeem':
        item['rewardsTitle'] = 'Spend';
        item['rewardsSymbol'] = '-';
        return item;
      case 'trade':
        item['cashTitle'] = 'Purchase';
        item['cashSymbol'] = '';
        return item;
      default:
        return item;
    }
  }

  render () {
    count++;
    if (count < 2) {
      const text = {'text': 'Value'};
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
    let cashHist = [];
    let rewardsHist = [];
    if (count === 0) {
      cashHist = [];
      rewardsHist = [];
    }
    const {history} = this.props;
    if (!history) {
      return <Spinner />;
    }
    let cash;
    let rewards;
    Amounts.forEach(function (item) {
      if (item.title === 'Ferly Cash') {
        cash = item;
      } else if (item.title === 'Ferly Rewards') {
        rewards = item;
      }
    });
    history.forEach(function (item) {
      if (item && item.design) {
        if (item.design.title === 'Ferly Cash') {
          cashHist.push(item);
        } else if (item.design.title === 'Ferly Rewards') {
          rewardsHist.push(item);
        }
      } else if (item.transfer_type === 'add') {
        cashHist.push(item);
      }
    });

    const tableHeader = (
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-around',
          height: width < 350 ? 30 : width > 600 ? 40 : 35,
          alignItems: 'center',
          paddingHorizontal: 20,
          backgroundColor: 'white'
        }}
      >
        <View style={{
          borderColor: 'white',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          width: width / 3
        }}>
          <Text
            allowFontScaling={false}
            style={{
              color: Theme.darkBlue,
              fontSize: width < 350 ? 14 : width > 600 ? 19 : 16,
              fontWeight: 'bold',
              paddingTop: 10
            }}>
            Amount
          </Text>
        </View>
        <View style={{
          borderColor: 'white',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          width: width / 3
        }}>
          <Text
            allowFontScaling={false}
            style={{
              color: Theme.darkBlue,
              fontSize: width < 350 ? 14 : width > 600 ? 19 : 16,
              fontWeight: 'bold',
              paddingTop: 10
            }}>
            Type
          </Text>
        </View>
        <View style={{
          borderColor: 'white',
          justifyContent: 'flex-end',
          alignItems: 'flex-start',
          flexDirection: 'row',
          width: width / 3
        }}>
          <Text
            allowFontScaling={false}
            style={{
              color: Theme.darkBlue,
              fontSize: width < 350 ? 14 : width > 600 ? 19 : 16,
              fontWeight: 'bold',
              paddingTop: 10
            }}>
            Expiration Date
          </Text>
        </View>
      </View>
    );

    const historyHeader = (
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15
      }}>
        <Text
          allowFontScaling={false}
          style={{
            color: Theme.darkBlue,
            width: width / 3,
            fontSize: width < 350 ? 14 : width > 600 ? 19 : 16,
            fontWeight: 'bold',
            paddingTop: 10
          }}>
        Date
        </Text>
        <Text
          allowFontScaling={false}
          style={{
            color: Theme.darkBlue,
            width: width / 3,
            fontSize: width < 350 ? 14 : width > 600 ? 19 : 16,
            fontWeight: 'bold',
            paddingTop: 10
          }}>
        Type
        </Text>
        <Text
          allowFontScaling={false}
          style={{
            color: Theme.darkBlue,
            width: width / 3,
            fontSize: width < 350 ? 14 : width > 600 ? 19 : 16,
            fontWeight: 'bold',
            textAlign: 'right',
            paddingRight: 30,
            paddingTop: 10
          }}>
        Amount
        </Text>
      </View>
    );

    const historyInfo = !cashHist ? null : cashHist.map((cashHistory, index) => {
      const b = cashHistory.timestamp.split(/\D+/);
      let cash = cashHistory.trade_Designs_Received[0];
      let rewardAmount = cashHistory.amount / 100 * 5;
      let formatted = accounting.formatMoney(parseFloat(rewardAmount));
      let reward = cashHistory.trade_Designs_Received[1];
      const date = new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5]));
      const dateDisplay = formatDate(date, 'MMM D');
      if (index < 5) {
        return this.renderRow(
          index,
          dateDisplay,
          `${reward === 'Ferly Rewards' && cash === 'Ferly Cash'
            ? 'Reward' : this.getCashTitle(cashHistory.transfer_type).cashTitle}`,
          `${reward === 'Ferly Rewards' && cash === 'Ferly Cash'
            ? '' : '$'}${reward === 'Ferly Rewards' && cash === 'Ferly Cash'
            ? formatted : cashHistory.amount}`,
          cashHistory
        );
      }
    });

    const historyRewardsInfo = !rewardsHist ? null : rewardsHist.map((rewardsHistoy, index) => {
      const b = rewardsHistoy.timestamp.split(/\D+/);
      let rewardAmount = rewardsHistoy.amount / 100 * 5;
      let formatted = accounting.formatMoney(parseFloat(rewardAmount));
      let cash = rewardsHistoy.trade_Designs_Received[0];
      let reward = rewardsHistoy.trade_Designs_Received[1];
      const date = new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5]));
      const dateDisplay = formatDate(date, 'MMM D');
      if (index < 5) {
        return this.renderRow(
          index,
          dateDisplay,
          `${reward === 'Ferly Rewards' && cash === 'Ferly Cash'
            ? 'Reward' : this.getCashTitle(rewardsHistoy.transfer_type).cashTitle}`,
          `${reward === 'Ferly Rewards' && cash !== 'Ferly Cash'
            ? '' : '$'}${reward === 'Ferly Rewards' && cash !== 'Ferly Cash'
            ? formatted : rewardsHistoy.amount}`,
          rewardsHistoy
        );
      }
    });

    const expiringInfo = !cash ? null : cash.expiring.map((expiration, index) => {
      const b = expiration.expire_time.split(/\D+/);
      const date = new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5]));
      const dateDisplay = formatDate(date, 'MM/DD/YYYY');
      if (index < 5) {
        return this.renderExpirationRow(index, `$${expiration.amount}`, `Gift`, dateDisplay);
      }
    });

    const expiringRewardsInfo = !rewards ? null : rewards.expiring.map((expiration, index) => {
      const b = expiration.expire_time.split(/\D+/);
      const date = new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5]));
      const dateDisplay = formatDate(date, 'MM/DD/YYYY');
      if (index < 5) {
        return this.renderExpirationRow(index, `$${expiration.amount}`, `Rewards`, dateDisplay);
      }
    });

    return (
      <ScrollView
        keyboardShouldPersistTaps='handled'
        style={{flex: 1, backgroundColor: 'white'}}>
        <View style={styles.headerContainer}>
          <Text
            allowFontScaling={false}
            style={{
              fontSize: width < 330 ? 19 : width > 600 ? 24 : 22,
              marginTop: 20,
              marginBottom: 10,
              color: 'white'
            }}>
            {!cash ? '' : cash.title}
          </Text>
          <Text
            allowFontScaling={false}
            style={styles.amount}>${!cash ? '0.00' : cash.amount}</Text>
          <Text
            allowFontScaling={false}
            style={{
              fontSize: width < 330 ? 14 : width > 600 ? 18 : 16,
              marginBottom: 10,
              color: 'white'
            }}>
            {`+ Rewards: ${!rewards ? '' : rewards.amount}`}
          </Text>
          {!cash
            ? <View style={{flexDirection: 'row', justifyContent: 'center'}}>
              <View style={{marginBottom: 20, marginRight: 10}}>
                <TestElement
                  parent={TouchableOpacity}
                  label='test-id-card-page'
                  style={{
                    flexDirection: 'row',
                    width: width / 3,
                    backgroundColor: Theme.lightBlue,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 5,
                    height: 30
                  }}
                  onPress={() => this.props.navigation.navigate('Recipient', cash)}>
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontSize: width < 350 ? 14 : width > 600 ? 18 : 16,
                      fontWeight: 'bold',
                      color: Theme.darkBlue
                    }}>
                    {`Learn More`}
                  </Text>
                  <Icon
                    style={{paddingLeft: 8}}
                    name="arrow-right"
                    color={Theme.darkBlue}
                    size={width < 350 ? 18 : width > 600 ? 26 : 20} />
                </TestElement>
              </View>
            </View>
            : <View style={{flexDirection: 'row', justifyContent: 'center'}}>
              <View style={{marginBottom: 20, marginRight: 10}}>
                <TestElement
                  parent={TouchableOpacity}
                  label='test-id-card-page'
                  style={{
                    flexDirection: 'row',
                    width: width < 600 ? width / 4 : width / 7,
                    backgroundColor: Theme.lightBlue,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 5,
                    height: 30
                  }}
                  onPress={() => this.props.navigation.navigate('Recipient', cash)}>
                  <Ico
                    style={{paddingRight: 8}}
                    name="card-giftcard"
                    color={Theme.darkBlue}
                    size={width < 350 ? 18 : width > 600 ? 26 : 20} />
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontSize: width < 350 ? 14 : width > 600 ? 18 : 16,
                      fontWeight: 'bold',
                      color: Theme.darkBlue
                    }}>
                    {`Give`}
                  </Text>
                </TestElement>
              </View>
              <View style={{marginBottom: width < 350 ? 20 : 20}}>
                <TestElement
                  parent={TouchableOpacity}
                  label='test-id-card-page'
                  style={{
                    flexDirection: 'row',
                    width: width < 600 ? width / 4 : width / 7,
                    backgroundColor: Theme.lightBlue,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 5,
                    height: 30
                  }}
                  onPress={() => this.props.navigation.navigate('LoadingInstructions')}>
                  <Icon
                    style={{paddingRight: 8}}
                    name="plus-circle"
                    color={Theme.darkBlue}
                    size={width < 350 ? 16 : width > 600 ? 24 : 18} />
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontSize: width < 350 ? 14 : width > 600 ? 18 : 16,
                      fontWeight: 'bold',
                      color: Theme.darkBlue
                    }}>
                    {`Add`}
                  </Text>
                </TestElement>
              </View>
            </View>
          }
        </View>
        <View>
          <View style={{
            borderBottomWidth: 2,
            borderBottomColor: Theme.lightBlue,
            marginBottom: 15,
            marginTop: 10
          }}>
            <Text
              allowFontScaling={false}
              style={styles.header}>Transactions</Text>
          </View>
          <View style={{flex: 1}}>
            {historyInfo.length > 0 ? historyHeader : null}
            {historyInfo}
            {historyRewardsInfo}
          </View>
          <View>
            <TouchableOpacity
              style={{
                backgroundColor: Theme.lightBlue,
                height: 35,
                width: width < 600 ? width / 4 : width / 7,
                flexDirection: 'row',
                alignSelf: 'center',
                justifyContent: 'center',
                borderRadius: 5,
                marginVertical: 10
              }}
              onPress={() => this.props.navigation.navigate('History')}>
              <Text
                allowFontScaling={false}
                style={styles.locations}>
              See All
              </Text>
              <Icon
                style={{paddingLeft: 8, alignSelf: 'center'}}
                name="arrow-right"
                color={Theme.darkBlue}
                size={width < 350 ? 16 : width > 600 ? 24 : 18} />
            </TouchableOpacity>
          </View>
          <View style={{
            borderBottomWidth: 2,
            borderBottomColor: Theme.lightBlue,
            marginBottom: 15
          }}>
            <Text
              allowFontScaling={false}
              style={styles.header}>Expiration Dates</Text>
          </View>
          {!expiringInfo ? null : tableHeader}
          {expiringInfo}
          {expiringRewardsInfo}
          <View style={{
            borderBottomWidth: 2,
            borderBottomColor: Theme.lightBlue,
            marginBottom: 15
          }}>
            <Text
              allowFontScaling={false}
              style={[styles.header, {marginTop: 20}]}>Fees</Text>
          </View>
          <Text
            allowFontScaling={false}
            style={styles.paragraph}>
            Your Ferly Cash and Ferly Rewards are NOT subject to dormancy, inactivity, or service
             fees.
          </Text>
          <Text
            allowFontScaling={false}
            style={{paddingBottom: 20}} />
        </View>
      </ScrollView>
    );
  }
}

let count = 0;
let Amounts = [];
const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: Theme.darkBlue,
    alignItems: 'center'
  },
  locations: {
    color: Theme.darkBlue,
    alignSelf: 'center',
    fontWeight: 'bold',
    fontSize: width < 350 ? 12 : width > 600 ? 16 : 14
  },
  amount: {
    color: 'white',
    fontSize: width < 330 ? 28 : width > 600 ? 37 : 35,
    marginBottom: width < 330 ? 8 : width > 600 ? 14 : 12
  },
  header: {
    color: Theme.darkBlue,
    fontSize: width > 600 ? 20 : 16,
    marginTop: 10,
    marginHorizontal: 15,
    marginBottom: 5
  },
  paragraph: {
    fontSize: width > 600 ? 18 : 16,
    marginBottom: 10,
    color: Theme.darkBlue,
    marginHorizontal: 15
  },
  entry: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    backgroundColor: 'white'
  }
});

FerlyValue.propTypes = {
  dispatch: PropTypes.func,
  history: PropTypes.array,
  navigation: PropTypes.object.isRequired,
  deviceToken: PropTypes.string.isRequired
};

function mapStateToProps (state, props) {
  const apiStore = state.api.apiStore;
  const {
    amounts,
    first_name: firstName,
    uids = []
  } = apiStore[urls.profile] || {};
  const {deviceToken} = state.settings;
  const historyResponse = apiStore[urls.history] || {};
  const history = historyResponse.history;
  const hasMore = historyResponse.has_more;
  Amounts = amounts;
  return {
    history,
    hasMore,
    amounts,
    firstName,
    uids,
    deviceToken
  };
}

export default connect(mapStateToProps)(FerlyValue);
