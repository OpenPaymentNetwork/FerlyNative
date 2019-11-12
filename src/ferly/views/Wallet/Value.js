import PropTypes from 'prop-types';
import React from 'react';
import Theme from 'ferly/utils/theme';
import {connect} from 'react-redux';
import {post} from 'ferly/utils/fetch';
import {viewLocations} from 'ferly/images/index';
import {format as formatDate} from 'date-fns';
import {
  Alert,
  Dimensions,
  View,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Linking
} from 'react-native';

export class Value extends React.Component {
  static navigationOptions = {
    title: 'Gift Value'
  };

  renderRow (key, column1, column2) {
    return (
      <View key={key} style={styles.tableRow}>
        <Text style={styles.leftColumn}>{column1}</Text>
        <Text>{column2}</Text>
      </View>
    );
  }

  openInMaps = () => {
    const {params: design} = this.props.navigation.state;
    const {title} = design;
    let newDesign = title.replace('&', 'and');
    const scheme = Platform.OS === 'ios' ? 'maps:0,0?q=' : 'geo:0,0?q=';
    const url = Platform.select({
      ios: `${scheme}${newDesign}`,
      android: `${scheme}(${newDesign})`
    });
    Linking.openURL(url);
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
    const {params: design} = this.props.navigation.state;
    const {amount, title, expiring = []} = design;
    const tableHeader = (
      <View style={styles.tableRow}>
        <Text style={[styles.leftColumn, {fontWeight: 'bold'}]}>Amount</Text>
        <Text style={{fontWeight: 'bold'}}>Expiration Date</Text>
      </View>
    );

    const expiringInfo = expiring.map((expiration, index) => {
      const b = expiration.expire_time.split(/\D+/);
      const date = new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5]));
      // React Native doesn't fully support Date.toLocaleString() on Android
      // use date-fns. Expect the JavaScriptCore to be updated in SDK 31.
      const dateDisplay = formatDate(date, 'MM/DD/YYYY');
      return this.renderRow(index, `$${expiration.amount}`, dateDisplay);
    });

    return (
      <ScrollView style={{flex: 1, padding: 20, backgroundColor: 'white'}}>
        <View style={styles.headerContainer}>
          <Text style={styles.amount}>${amount}</Text>
          <Text style={{fontSize: 22, marginBottom: 50, color: Theme.lightBlue}}>{title}</Text>
        </View>
        <Text style={styles.header}>Redemption Locations</Text>
        <Text style={styles.paragraph}>
          Click the button below to view {title} locations where you can
          redeem this gift value for goods and services.
        </Text>
        <TouchableOpacity
          onPress={this.openInMaps}>
          <Image
            source={viewLocations}
            style={styles.image}/>
          <Text style={styles.locations}>
              View Locations
          </Text>
        </TouchableOpacity>
        <Text style={styles.header}>Expiration</Text>
        <Text style={styles.paragraph}>
          This value is subject to the following expiration dates:
        </Text>
        {expiringInfo.length > 0 ? tableHeader : null}
        {expiringInfo}
        <Text style={[styles.paragraph, {marginTop: 10}]}>
          Expiration dates are inherited by those you send value to.
        </Text>
        <Text style={styles.header}>Fees</Text>
        <Text style={styles.paragraph}>
          This value is not subject to dormancy, inactivity, or service fees.
        </Text>
        <Text style={styles.header}>Customer Support</Text>
        <Text>
          <Text style={styles.supportParagraph}>
            Please call Ferly, Inc. at </Text>
          <Text style={[
            styles.supportParagraph,
            {textDecorationLine: 'underline'}]}
          onPress={() => { Linking.openURL('tel://8006512186'); }}>
            (800) 651-2186 </Text>
          <Text style={styles.supportParagraph}>
            Monday through Friday from 9:00 am - 5:00 pm MST, or email </Text>
          <Text style={[
            styles.supportParagraph,
            {textDecorationLine: 'underline'}]}
          onPress={() => { Linking.openURL('mailto:support@ferly.com'); }}>
            support@ferly.com.
          </Text>
        </Text>
        <Text style={{paddingTop: 20}} />
      </ScrollView>
    );
  }
}

let count = 0;

const {width} = Dimensions.get('window');
const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: 'lightgray'
  },
  locations: {
    alignSelf: 'center',
    marginTop: 30,
    fontWeight: 'bold',
    fontSize: 15,
    position: 'absolute'
  },
  amount: {color: Theme.lightBlue, fontSize: 35, marginBottom: 12, marginTop: 30},
  header: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10
  },
  image: {width: width - 40, height: 80, borderRadius: 10},
  paragraph: {fontSize: 16, marginBottom: 10, color: 'gray'},
  supportParagraph: {fontSize: 16, color: 'gray'},
  tableRow: {flexDirection: 'row', paddingLeft: 10},
  leftColumn: {width: 120}
});

Value.propTypes = {
  navigation: PropTypes.object.isRequired,
  deviceToken: PropTypes.string.isRequired
};

function mapStateToProps (state, props) {
  const {deviceToken} = state.settings;
  return {
    deviceToken
  };
}

export default connect(mapStateToProps)(Value);
