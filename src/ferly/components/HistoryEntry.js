import accounting from 'ferly/utils/accounting';
import PropTypes from 'prop-types';
import React from 'react';
import TestElement from 'ferly/components/TestElement';
import {connect} from 'react-redux';
import {setRefreshHistory} from 'ferly/store/settings';
import Theme from 'ferly/utils/theme';
import Icon from 'react-native-vector-icons/EvilIcons';
import {format as formatDate} from 'date-fns';
import {Text, View, StyleSheet, TouchableOpacity, Dimensions} from 'react-native';

export class HistoryEntry extends React.Component {
  componentDidMount () {
    if (this.props.refreshHistory) {
      this.props.dispatch(setRefreshHistory(false));
      this.props.navigation.navigate('History');
    }
  }
  render () {
    const {entry, navigation} = this.props;
    const {amount} = entry;
    const transferType = entry.transfer_type;
    const tradeDesign = entry.trade_Designs_Received;
    const reason = entry.reason;
    const expired = entry.expired;

    let titleVerb;
    let symbol;
    switch (transferType) {
      case 'add':
        titleVerb = 'Add';
        symbol = '+';
        break;
      case 'purchase':
        titleVerb = 'Add';
        symbol = '+';
        break;
      case 'send':
        titleVerb = 'Send Gift';
        symbol = '-';
        break;
      case 'pending':
        titleVerb = 'Pending Gift';
        symbol = '-';
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
    }
    if (transferType === 'trade') {
      if (tradeDesign[1] === 'Ferly Rewards') {
        titleVerb = 'Reward';
        symbol = '+';
      } else {
        titleVerb = 'Purchase';
        symbol = '';
      }
    }
    if (entry.odfi || entry.odfi_name) {
      if (entry.debits) {
        titleVerb = 'Ach Confirmation';
        symbol = '';
      } else if (entry.credits) {
        titleVerb = 'Ach Confirmation';
        symbol = '';
      }
    }
    if (reason) {
      titleVerb = 'Spend Error';
      symbol = '';
    }
    if (expired) {
      titleVerb = 'Expired Gift';
      symbol = '';
    }
    let rewardsAmount = amount / 100 * 5;
    rewardsAmount = accounting.formatMoney(parseFloat(rewardsAmount));
    const b = entry.timestamp.split(/\D+/);
    const date = new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5]));
    // React Native doesn't fully support Date.toLocaleString() on Android
    // use date-fns. Expect the JavaScriptCore to be updated in SDK 31.
    const dateDisplay = formatDate(date, 'MMM D');

    return (
      <TestElement
        parent={TouchableOpacity}
        label='test-id-history-entry'
        style={styles.entry}
        onPress={
          () => navigation.navigate('Transfer', {...entry, title: titleVerb})}>
        <View style={{
          borderColor: 'white',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          width: width / 3
        }}>
          <Text style={{color: Theme.darkBlue, fontSize: width > 600 ? 19 : 16}}>
            {dateDisplay}
          </Text>
        </View>
        <View style={{
          borderColor: 'white',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          width: width / 3
        }}>
          <Text style={{color: Theme.darkBlue, fontSize: width > 600 ? 19 : 16}}>
            {`${titleVerb}`}
          </Text>
        </View>
        <View style={{
          borderColor: 'white',
          justifyContent: 'flex-end',
          alignItems: 'flex-end',
          flexDirection: 'row',
          width: width / 3 + 3,
          paddingRight: 30
        }}>
          {transferType === 'canceled' ||
          (transferType === 'trade' && tradeDesign[1] !== 'Ferly Rewards')
            ? <Icon
              name="refresh"
              color={Theme.darkBlue}
              size={width < 330 ? 22 : 24 && width > 600 ? 30 : 24} />
            : null
          }
          <Text style={{
            color: Theme.darkBlue, fontSize: width > 600 ? 19 : 16
          }}>
            {
              tradeDesign[1] === 'Ferly Rewards'
                ? `${symbol}${rewardsAmount}` : `${symbol}$${amount}` &&
              (entry.debits || entry.credits)
                  ? `${symbol}$0.00` : `${symbol}$${amount}`
            }
          </Text>
        </View>
      </TestElement>
    );
  }
}

let {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  entry: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: width < 350 ? 55 : 75 && width > 600 ? 100 : 75,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: 'black',
    paddingHorizontal: 15,
    backgroundColor: 'white'
  }
});

HistoryEntry.propTypes = {
  dispatch: PropTypes.func.isRequired,
  refreshHistory: PropTypes.bool.isRequired,
  entry: PropTypes.shape({
    amount: PropTypes.string.isRequired,
    counter_party: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
    design_title: PropTypes.string.isRequired,
    trade_Designs_Received: PropTypes.array,
    transfer_type: PropTypes.string.isRequired,
    reason: PropTypes.string,
    debits: PropTypes.array,
    credits: PropTypes.array,
    odfi: PropTypes.string,
    odfi_name: PropTypes.string,
    expired: PropTypes.bool
  }),
  navigation: PropTypes.object.isRequired
};

function mapStateToProps (state) {
  const {refreshHistory} = state.settings;
  return {
    refreshHistory
  };
}

export default connect(mapStateToProps)(HistoryEntry);
