import PropTypes from 'prop-types'
import React from 'react'
import {format as formatDate} from 'date-fns'
import {View, Text, Button} from 'react-native'

export class Value extends React.Component {
  static navigationOptions = {
    title: 'Gift Value'
  };

  render () {
    const {navigation} = this.props
    const {params: design} = this.props.navigation.state
    const {amount, title, expiring = []} = design

    const expiringInfo = expiring.map((expiration, index) => {
      const b = expiration.expire_time.split(/\D+/)
      const date = new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5]))
      // React Native doesn't fully support Date.toLocaleString() on Android
      // use date-fns. Expect the JavaScriptCore to be updated in SDK 31.
      const dateDisplay = formatDate(date, 'MMM D, YYYY')
      return (
        <Text key={index}>
          {`$${expiration.amount} expires on ${dateDisplay}`}
        </Text>
      )
    })

    return (
      <View style={{flex: 1, padding: 20, backgroundColor: 'white'}}>
        <View>
          <Text style={{fontWeight: 'bold', fontSize: 22}}>{title}</Text>
          <Text style={{color: 'gray'}}>Balance: ${amount}</Text>
        </View>
        {expiringInfo}
        <Text>There are no fees associated with holding this gift value.</Text>
        <Button
          title="Show locations"
          onPress={() => navigation.navigate('Locations', {design})} />
      </View>
    )
  }
}

Value.propTypes = {
  navigation: PropTypes.object.isRequired
}

export default Value
