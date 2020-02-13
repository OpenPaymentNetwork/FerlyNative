import Icon from 'react-native-vector-icons/FontAwesome';
import PropTypes from 'prop-types';
import React from 'react';
import TestElement from 'ferly/components/TestElement';
import {connect} from 'react-redux';
import {setRefreshHistory} from 'ferly/store/settings';
import Theme from 'ferly/utils/theme';
import {
  giveBlue,
  addBlue,
  spendBlue,
  receiveBlue,
  pendingBlue,
  cancelBlue
} from 'ferly/images/index';
import {Text, View, Image, StyleSheet, TouchableOpacity, Dimensions} from 'react-native';

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
    const designTitle = entry.design_title;
    const transferType = entry.transfer_type;
    const counterParty = entry.counter_party;

    const icon = (
      <Icon
        name="angle-right"
        color="black"
        size={28} />
    );

    let iconSource;
    let titleVerb;
    let involved;
    switch (transferType) {
      case 'purchase':
        iconSource = addBlue;
        titleVerb = 'Added';
        involved = 'to your Wallet';
        break;
      case 'send':
        iconSource = giveBlue;
        titleVerb = 'Gifted';
        involved = `to ${counterParty}`;
        break;
      case 'pending':
        iconSource = pendingBlue;
        titleVerb = 'Pending Gift';
        involved = `to ${counterParty}`;
        break;
      case 'canceled':
        iconSource = cancelBlue;
        titleVerb = 'Canceled';
        involved = `to ${counterParty}`;
        break;
      case 'receive':
        iconSource = receiveBlue;
        titleVerb = 'Received';
        involved = `from ${counterParty}`;
        break;
      case 'redeem':
        iconSource = spendBlue;
        titleVerb = 'Paid';
        involved = 'with your Ferly Card';
        break;
    }
    let all = designTitle + ' ' + involved;
    if (width < 330) {
      let total = designTitle.length + involved.length;
      if (total > 30) {
        all = all.slice(0, 30);
        all = all + '...';
      }
    } else if (width > 330 && width < 420) {
      let total = designTitle.length + involved.length;
      if (total > 40) {
        all = all.slice(0, 40);
        all = all + '...';
      }
    }

    return (
      <TestElement
        parent={TouchableOpacity}
        label='test-id-history-entry'
        style={styles.entry}
        onPress={
          () => navigation.navigate('Transfer', {...entry, title: titleVerb})}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image style={styles.image} source={iconSource} />
          <View style={{flexDirection: 'column', paddingLeft: 15}}>
            <Text style={{fontWeight: 'bold', fontSize: width > 600 ? 24 : 20}}>
              {`${titleVerb} $${amount}`}
            </Text>
            <Text style={{
              color: Theme.lightBlue, fontSize: width > 600 ? 16 : 13, marginRight: -100
            }}>
              {`${all}`}
            </Text>
          </View>
        </View>
        {icon}
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
    height: width > 600 ? 110 : 90,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'black',
    paddingHorizontal: 15,
    backgroundColor: 'white'
  },
  image: {
    resizeMode: 'contain',
    height: width > 600 ? 50 : 44,
    width: width > 600 ? 50 : 44
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
    transfer_type: PropTypes.string.isRequired
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
