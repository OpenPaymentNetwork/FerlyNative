import PropTypes from 'prop-types';
import React from 'react';
import Theme from 'ferly/utils/theme';
import Icon from 'react-native-vector-icons/Feather';
import I from 'react-native-vector-icons/FontAwesome';
import Ico from 'react-native-vector-icons/MaterialIcons';
import TestElement from 'ferly/components/TestElement';
import {connect} from 'react-redux';
import {apiRequire} from 'ferly/store/api';
import Spinner from 'ferly/components/Spinner';
import {post, urls} from 'ferly/utils/fetch';
import {format as formatDate} from 'date-fns';
import {
  Alert,
  Dimensions,
  View,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking
} from 'react-native';

export class Value extends React.Component {
  static navigationOptions = {
    title: 'Gift Value'
  };

  componentDidMount () {
    this.props.dispatch(apiRequire(urls.history));
  }

  renderRow (key, column1, column2, column3, design) {
    let titleVerb;
    let symbol;
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
      case 'trade':
        titleVerb = 'Purchase';
        symbol = '';
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
          width: width / 3,
          paddingRight: 30
        }}>
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

  openInMaps = () => {
    const params = this.props.navigation.state.params;
    const {design} = params;
    const {title} = design;
    let newDesign = title.replace('&', 'and');
    const scheme = Platform.OS === 'ios' ? 'maps:0,0?q=' : 'geo:0,0?q=';
    const url = Platform.select({
      ios: `${scheme}${newDesign}`,
      android: `${scheme}(${newDesign})`
    });
    Linking.openURL(url);
  }

  getCashTitle (transferType) {
    let item = {};
    switch (transferType) {
      case 'purchase':
        item['cashTitle'] = 'Add';
        item['cashSymbol'] = '+';
        return item;
      case 'add':
        item['rewardsTitle'] = 'Add';
        item['rewardsSymbol'] = '+';
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
    const {navigation, history} = this.props;
    if (!history) {
      return <Spinner />;
    }
    const params = navigation.state.params;
    const {design} = params;
    const {amount, title, expiring = []} = design;
    let loyaltyExpiration = design.expiringAmounts;
    let loyaltyAmount = '';
    if (design.loyaltyAmount) {
      loyaltyAmount = design.loyaltyAmount;
    }
    let valueHist = [];
    let loyalHist = [];

    history.forEach(function (item) {
      if (item && item.design) {
        if (item.trade_Designs_Received[0] === title) {
          valueHist.push(item);
        }
        if (item.design.title === title) {
          valueHist.push(item);
        } else if (item.design.title.includes('Loyalty')) {
          if (item.design.title.includes(title)) {
            loyalHist.push(item);
          }
        }
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

    const historyInfo = !valueHist ? null : valueHist.map((valueHistory, index) => {
      const b = valueHistory.timestamp.split(/\D+/);
      const date = new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5]));
      // React Native doesn't fully support Date.toLocaleString() on Android
      // use date-fns. Expect the JavaScriptCore to be updated in SDK 31.
      const dateDisplay = formatDate(date, 'MMM D');
      if (index < 5) {
        return this.renderRow(
          index,
          dateDisplay,
          `${this.getCashTitle(valueHistory.transfer_type).cashTitle}`,
          `$${valueHistory.amount}`,
          valueHistory,
          this.getCashTitle(valueHistory.transfer_type).cashTitle
        );
      }
    });

    const LoyalHistoryInfo = !loyalHist ? null : loyalHist.map((loyalHistory, index) => {
      const b = loyalHistory.timestamp.split(/\D+/);
      const date = new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5]));
      // React Native doesn't fully support Date.toLocaleString() on Android
      // use date-fns. Expect the JavaScriptCore to be updated in SDK 31.
      const dateDisplay = formatDate(date, 'MMM D');
      if (index < 5) {
        return this.renderRow(
          index,
          dateDisplay,
          `${this.getLoyalTitle(loyalHistory.transfer_type).rewardsTitle}`,
          `$${loyalHistory.amount}`,
          loyalHistory,
          this.getLoyalTitle(loyalHistory.transfer_type).rewardsTitle
        );
      }
    });

    const loyaltyExpiringInfo = !loyaltyExpiration ? null : loyaltyExpiration.map((expiringAmounts, index) => {
      const b = expiringAmounts.expire_time.split(/\D+/);
      const date = new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5]));
      // React Native doesn't fully support Date.toLocaleString() on Android
      // use date-fns. Expect the JavaScriptCore to be updated in SDK 31.
      const dateDisplay = formatDate(date, 'MM/DD/YYYY');
      if (index < 5) {
        return this.renderExpirationRow(index, `$${expiringAmounts.amount}`, `Loyalty`, dateDisplay);
      }
    });

    const expiringInfo = expiring.map((expiration, index) => {
      const b = expiration.expire_time.split(/\D+/);
      const date = new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5]));
      // React Native doesn't fully support Date.toLocaleString() on Android
      // use date-fns. Expect the JavaScriptCore to be updated in SDK 31.
      const dateDisplay = formatDate(date, 'MM/DD/YYYY');
      if (index < 5) {
        return this.renderExpirationRow(index, `$${expiration.amount}`, `Gift`, dateDisplay);
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
              color: Theme.darkBlue
            }}>
            {title}
          </Text>
          <Text
            allowFontScaling={false}
            style={styles.amount}>${amount}</Text>
          {design.authorized_merchant
            ? <Text
              allowFontScaling={false}
              style={{
                fontSize: width < 330 ? 14 : width > 600 ? 18 : 16,
                marginBottom: 10,
                color: Theme.darkBlue
              }}>
              {loyaltyAmount ? `+ Loyalty: $${loyaltyAmount}` : `+ Loyalty: $0.00`}
            </Text> : null
          }
          <View style={{flexDirection: 'row', justifyContent: 'center'}}>
            <View style={{marginBottom: 20, marginRight: 10}}>
              <TestElement
                parent={TouchableOpacity}
                label='test-id-card-page'
                style={{
                  flexDirection: 'row',
                  width: width < 600 ? width / 4 : width / 7,
                  backgroundColor: Theme.darkBlue,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 5,
                  height: 30
                }}
                onPress={() => this.props.navigation.navigate('Recipient', design)}>
                <Ico
                  style={{paddingRight: 8}}
                  name="card-giftcard"
                  color={'white'}
                  size={width < 350 ? 18 : width > 600 ? 24 : 20} />
                <Text
                  allowFontScaling={false}
                  style={{
                    fontSize: width < 350 ? 14 : width > 600 ? 18 : 16,
                    color: 'white'
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
                  backgroundColor: Theme.darkBlue,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 5,
                  height: 30
                }}
                onPress={() => this.props.navigation.navigate('Purchase', {design})}>
                <Icon
                  style={{paddingRight: 8}}
                  name="plus-circle"
                  color={'white'}
                  size={width < 350 ? 16 : width > 600 ? 22 : 18} />
                <Text
                  allowFontScaling={false}
                  style={{
                    fontSize: width < 350 ? 14 : width > 600 ? 18 : 16,
                    color: 'white'
                  }}>
                  {`Buy`}
                </Text>
              </TestElement>
            </View>
          </View>
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
            {LoyalHistoryInfo}
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: Theme.lightBlue,
              height: 32,
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
          <View style={{
            borderBottomWidth: 2,
            borderBottomColor: Theme.lightBlue,
            marginBottom: 15
          }}>
            <Text
              allowFontScaling={false}
              style={styles.header}>Expiration Dates</Text>
          </View>
          {expiringInfo.length > 0 ? tableHeader : null}
          {expiringInfo}
          {loyaltyExpiringInfo}
          <View style={{borderBottomWidth: 2, borderBottomColor: Theme.lightBlue, marginBottom: 15}}>
            <Text
              allowFontScaling={false}
              style={[styles.header, {marginTop: 20}]}>Fees</Text>
          </View>
          <Text
            allowFontScaling={false}
            style={styles.paragraph}>
            {`Your ${title} balance and loyalty are NOT subject to dormancy, inactivity, or ` +
            `service fees.`}
          </Text>
          <View style={{borderBottomWidth: 2, borderBottomColor: Theme.lightBlue, marginBottom: 15}}>
            <Text
              allowFontScaling={false}
              style={styles.header}>Participating Locations</Text>
          </View>
          <Text
            allowFontScaling={false}
            style={styles.paragraph}>
            {`The Ferly Card can be used to spend your ${title} value at any ${title} ` +
            `located in the United States.`}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: Theme.lightBlue,
              height: 32,
              width: width < 600 ? width / 4 : width / 7,
              flexDirection: 'row',
              alignSelf: 'center',
              justifyContent: 'center',
              borderRadius: 5,
              marginVertical: 10
            }}
            onPress={this.openInMaps}>
            <Text
              allowFontScaling={false}
              style={styles.locations}>
              Open Maps
            </Text>
            <I
              style={{paddingLeft: 8, alignSelf: 'center'}}
              name="share-square"
              color={Theme.darkBlue}
              size={width < 350 ? 16 : width > 600 ? 24 : 18} />
          </TouchableOpacity>
          <Text
            allowFontScaling={false}
            style={{paddingBottom: 20}} />
        </View>
      </ScrollView>
    );
  }
}

let count = 0;
const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: Theme.lightBlue,
    alignItems: 'center'
  },
  locations: {
    color: Theme.darkBlue,
    alignSelf: 'center',
    fontWeight: 'bold',
    fontSize: width < 350 ? 12 : width > 600 ? 16 : 14
  },
  amount: {
    color: Theme.darkBlue,
    fontSize: width < 330 ? 28 : width > 600 ? 37 : 35,
    marginBottom: width < 330 ? 6 : width > 600 ? 12 : 8
  },
  header: {
    color: Theme.darkBlue,
    fontSize: width > 600 ? 20 : 16,
    marginTop: 10,
    marginHorizontal: 15,
    marginBottom: 5
  },
  entry: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    backgroundColor: 'white'
  },
  paragraph: {
    fontSize: width > 600 ? 18 : 16,
    marginBottom: 10,
    color: Theme.darkBlue,
    marginHorizontal: 15
  }
});

Value.propTypes = {
  history: PropTypes.array,
  dispatch: PropTypes.func,
  apiRequire: PropTypes.func,
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
  const historyResponse = apiStore[urls.history] || {};
  const history = historyResponse.history;
  const {deviceToken} = state.settings;
  return {
    history,
    amounts,
    firstName,
    uids,
    deviceToken
  };
}

export default connect(mapStateToProps)(Value);
