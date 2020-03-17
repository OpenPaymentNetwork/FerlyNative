import PropTypes from 'prop-types';
import React from 'react';
import TestElement from 'ferly/components/TestElement';
import {connect} from 'react-redux';
import {setRefreshHistory} from 'ferly/store/settings';
import Theme from 'ferly/utils/theme';
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
    const reason = entry.reason;
    const expired = entry.expired;

    let titleVerb;
    let symbol = '';
    switch (transferType) {
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
    if (reason) {
      titleVerb = 'Spend Error';
    }
    if (expired) {
      titleVerb = 'Expired Gift';
    }
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
          width: width / 3,
          paddingRight: 30
        }}>
          <Text style={{
            color: Theme.darkBlue, fontSize: width > 600 ? 19 : 16
          }}>
            {`${symbol}$${amount}`}
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
    transfer_type: PropTypes.string.isRequired,
    reason: PropTypes.string,
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
