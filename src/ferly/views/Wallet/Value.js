import Avatar from 'ferly/components/Avatar'
import PropTypes from 'prop-types'
import React from 'react'
import Theme from 'ferly/utils/theme'
import {viewLocations} from 'ferly/images/index'
import {format as formatDate} from 'date-fns'
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Linking
} from 'react-native'

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
    )
  }

  render () {
    const {navigation} = this.props
    const {params: design} = this.props.navigation.state
    const {amount, title, expiring = [], logo_image_url: logoImageUrl} = design

    const tableHeader = (
      <View style={styles.tableRow}>
        <Text style={[styles.leftColumn, {fontWeight: 'bold'}]}>Amount</Text>
        <Text style={{fontWeight: 'bold'}}>Expiration Date</Text>
      </View>
    )

    const expiringInfo = expiring.map((expiration, index) => {
      const b = expiration.expire_time.split(/\D+/)
      const date = new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5]))
      // React Native doesn't fully support Date.toLocaleString() on Android
      // use date-fns. Expect the JavaScriptCore to be updated in SDK 31.
      const dateDisplay = formatDate(date, 'MM/DD/YYYY')
      return this.renderRow(index, `$${expiration.amount}`, dateDisplay)
    })

    return (
      <ScrollView style={{flex: 1, padding: 20, backgroundColor: 'white'}}>
        <View style={styles.headerContainer}>
          <Avatar pictureUrl={logoImageUrl} size={100} />
          <Text style={{fontSize: 24, marginVertical: 8}}>{title}</Text>
          <Text style={styles.amount}>${amount}</Text>
        </View>
        <Text style={styles.header}>Redemption Locations</Text>
        <Text style={styles.paragraph}>
          Click the button below to view {title} locations where you can
          redeem this gift value for goods and services.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Locations', {design})}>
          <Image
            source={viewLocations}
            style={styles.image}/>
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
          onPress={() => { Linking.openURL('tel://8006512186') }}>
            (800) 651-2186 </Text>
          <Text style={styles.supportParagraph}>
            Monday through Friday from 9:00 am - 5:00 pm MST, or email </Text>
          <Text style={[
            styles.supportParagraph,
            {textDecorationLine: 'underline'}]}
          onPress={() => { Linking.openURL('mailto:support@ferly.com') }}>
            support@ferly.com.
          </Text>
        </Text>
        <Text style={{paddingTop: 20}} />
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: 'lightgray'
  },
  amount: {color: Theme.lightBlue, fontSize: 22, marginBottom: 12},
  header: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10
  },
  image: {resizeMode: 'stretch', width: undefined},
  paragraph: {fontSize: 16, marginBottom: 10, color: 'gray'},
  supportParagraph: {fontSize: 16, color: 'gray'},
  tableRow: {flexDirection: 'row', paddingLeft: 10},
  leftColumn: {width: 120}
})

Value.propTypes = {
  navigation: PropTypes.object.isRequired
}

export default Value
