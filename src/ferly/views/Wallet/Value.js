import Avatar from 'ferly/components/Avatar'
import PropTypes from 'prop-types'
import React from 'react'
import Theme from 'ferly/utils/theme'
import {format as formatDate} from 'date-fns'
import {View, ScrollView, Text, Button, StyleSheet} from 'react-native'

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
        <View style={{maxWidth: 220, marginVertical: 4}}>
          <Button
            color={Theme.lightBlue}
            title="Show locations"
            onPress={() => navigation.navigate('Locations', {design})} />
        </View>
        <Text style={styles.header}>Expiration</Text>
        <Text style={styles.paragraph}>
          This value is subject to the following expiration dates. Expiration
          dates are inherited by those you send value to.
        </Text>
        {expiringInfo.length > 0 ? tableHeader : null}
        {expiringInfo}
        <Text style={styles.header}>Fees</Text>
        <Text style={styles.paragraph}>
          This value is not subject to dormancy, inactivity, or service fees.
        </Text>
        <Text style={styles.header}>Customer Support</Text>
        <Text style={styles.paragraph}>
          Please call Ferly, Inc. at (800) 651-2186 Monday through Friday
          from 9:00 am - 5:00 pm MST, or email support@ferly.com.
        </Text>
        <View style={{height: 20}} />
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
    color: Theme.lightBlue,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4
  },
  paragraph: {fontSize: 16,marginBottom: 10},
  tableRow: {flexDirection: 'row', paddingLeft: 10},
  leftColumn: {width: 120}
})

Value.propTypes = {
  navigation: PropTypes.object.isRequired
}

export default Value
