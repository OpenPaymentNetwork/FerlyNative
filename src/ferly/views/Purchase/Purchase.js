/* eslint-disable react/no-unescaped-entities */
import accounting from 'ferly/utils/accounting';
import PrimaryButton from 'ferly/components/PrimaryButton';
import PropTypes from 'prop-types';
import React from 'react';
import SimpleCurrencyInput from 'ferly/components/SimpleCurrencyInput';
import Spinner from 'ferly/components/Spinner';
import {viewLocations} from 'ferly/images/index';
import {apiExpire, apiRequire} from 'ferly/store/api';
import {connect} from 'react-redux';
import {format as formatDate} from 'date-fns';
import {urls, post} from 'ferly/utils/fetch';
import {
  Alert,
  Dimensions,
  Platform,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking
} from 'react-native';

export class Purchase extends React.Component {
  static navigationOptions = {
    title: 'Purchase'
  };

  constructor (props) {
    super(props);
    this.state = {amount: 0, submitting: false, text: ''};
  }

  componentDidMount () {
    this.props.apiRequire(urls.profile);
  }

  openInMaps = () => {
    const {params} = this.props.navigation.state;
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

  onPurchase () {
    const {navigation} = this.props;
    const params = navigation.state.params;
    const {design, cashDesign, rewardsDesign} = params;
    const amount = this.state.text;
    navigation.navigate('Cart', {amount, design, cashDesign, rewardsDesign});
  }

  onChange (newAmount) {
    this.setState({text: newAmount});
  }

  render () {
    count++;
    if (count < 2) {
      const text = {'text': 'Purchase'};
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
    const {params} = this.props.navigation.state;
    const {submitting, text} = this.state;
    const {design} = params;
    const {title, fee} = design;
    const amounts = this.props.amounts || [];

    const found = amounts.find((cashRow) => {
      return cashRow.id === design.id;
    });

    const foundAmount = found ? found.amount : 0;
    const formatted = accounting.formatMoney(parseFloat(foundAmount));
    const fieldValue = accounting.formatMoney(parseFloat(text));
    const precision = fee.includes('.00') ? 0 : 2;

    const formatedFee = accounting.formatMoney(parseFloat(fee), '', precision);

    const d = new Date();
    d.setDate(d.getDate() + 1825);
    const expirationDate = formatDate(d, 'M/D/YYYY');

    return (
      <View style={{
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: 'white'}}>
        <ScrollView keyboardShouldPersistTaps='handled' style={styles.contentContainer}>
          <View style={styles.topRow}>
            <View style={{flexShrink: 1, paddingVertical: 14}}>
              <Text
                allowFontScaling={false}
                style={styles.title}>{title}</Text>
              <Text
                allowFontScaling={false}
                style={{color: 'gray', fontSize: width > 600 ? 14 : 12}}>
                Balance: {formatted}
              </Text>
            </View>
            <View>
              <SimpleCurrencyInput onChangeText={this.onChange.bind(this)} />
            </View>
          </View>
          <Text
            allowFontScaling={false}
            style={styles.header}>Online Fee</Text>
          <Text
            allowFontScaling={false}
            style={styles.paragraph}>
            The purchase of this gift value is subject to
            a ${formatedFee} online fee.
          </Text>
          <Text
            allowFontScaling={false}
            style={styles.header}>Redemption Locations</Text>
          <Text
            allowFontScaling={false}
            style={styles.paragraph}>
            Click the button below to view {title} locations where you can
            use your Ferly Card.
          </Text>
          <TouchableOpacity
            onPress={this.openInMaps}
          >
            <Image
              source={viewLocations}
              style={styles.image}/>
            <Text
              allowFontScaling={false}
              style={styles.locations}>
              View Locations
            </Text>
          </TouchableOpacity>
          <Text
            allowFontScaling={false}
            style={styles.header}>Expiration and Fees</Text>
          <Text
            allowFontScaling={false}
            style={styles.paragraph}>
            Gift value expires {expirationDate}, five years after the date of
            purchase. Dormancy, inactivity, or service fees do not apply to
            purchased gift value.
          </Text>
          <Text
            allowFontScaling={false}
            style={styles.header}>Terms</Text>
          <Text
            allowFontScaling={false}>
            <Text
              allowFontScaling={false}
              style={styles.paragraph}>
              The purchase of this gift value is subject to the Ferly Cardholder
              and App Agreement and Ferly's Privacy Policy and Refund Policy.
              Please contact us at </Text>
            <Text
              allowFontScaling={false}
              onPress={() => { Linking.openURL('tel://8006512186'); }}
              style={[styles.paragraph, {textDecorationLine: 'underline'}]}>
              (800) 651-2186 </Text>
            <Text
              allowFontScaling={false}
              style={styles.paragraph}>for any questions.</Text>
          </Text>
        </ScrollView>
        {submitting ? <Spinner /> : null}
        <PrimaryButton
          title="Checkout"
          disabled={fieldValue === '$0.00' || submitting}
          onPress={this.onPurchase.bind(this)}
        />
      </View>
    );
  }
}

let count = 0;
const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
    paddingHorizontal: 20
  },
  topRow: {
    flexShrink: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: 'lightgray'
  },
  title: {
    flexShrink: 1,
    fontWeight: 'bold',
    flexWrap: 'wrap',
    fontSize: width > 600 ? 24 : 22,
    paddingRight: 20
  },
  header: {
    color: 'black',
    fontSize: width > 600 ? 18 : 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4
  },
  locations: {
    alignSelf: 'center',
    marginTop: 30,
    fontWeight: 'bold',
    fontSize: width > 600 ? 18 : 15,
    position: 'absolute'
  },
  image: {width: width - 40, height: width > 600 ? 100 : 80, borderRadius: 10},
  paragraph: {fontSize: width > 600 ? 18 : 16, marginBottom: 10, color: 'darkgray'}
});

Purchase.propTypes = {
  amounts: PropTypes.array,
  apiExpire: PropTypes.func.isRequired,
  apiRequire: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  deviceToken: PropTypes.string.isRequired
};

function mapStateToProps (state) {
  const {deviceToken} = state.settings;
  const apiStore = state.api.apiStore;
  const {amounts} = apiStore[urls.profile] || {};

  return {
    amounts,
    deviceToken
  };
}

const mapDispatchToProps = {
  apiExpire,
  apiRequire
};

export default connect(mapStateToProps, mapDispatchToProps)(Purchase);
