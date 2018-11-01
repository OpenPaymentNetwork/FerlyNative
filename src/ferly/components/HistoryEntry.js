// import Icon from 'react-native-vector-icons/FontAwesome'
import PropTypes from 'prop-types'
import React from 'react'
import Theme from 'ferly/utils/theme'
import {giveBlue, addBlue, spendBlue, receiveBlue} from 'ferly/images/index'
import {Text, View, Image, StyleSheet} from 'react-native'

export default class HistoryEntry extends React.Component {
  render () {
    const {entry} = this.props
    const {amount, title} = entry
    const transferType = entry.transfer_type
    const counterParty = entry.counter_party

    // const icon = (
    //   <Icon
    //     name="angle-right"
    //     color="black"
    //     size={28} />
    // )

    let iconSource
    let titleVerb
    let involved
    switch (transferType) {
      case 'purchase':
        iconSource = addBlue
        titleVerb = 'Added'
        involved = 'to your Wallet'
        break
      case 'send':
        iconSource = giveBlue
        titleVerb = 'Gifted'
        involved = `to ${counterParty}`
        break
      case 'receive':
        iconSource = receiveBlue
        titleVerb = 'Received'
        involved = `from ${counterParty}`
        break
      case 'redeem':
        iconSource = spendBlue
        titleVerb = 'Paid'
        involved = 'with your Ferly Card'
        break
    }

    return (
      <View style={styles.entry}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image style={styles.image} source={iconSource} />
          <View style={{flexDirection: 'column', paddingLeft: 15}}>
            <Text style={{fontWeight: 'bold', fontSize: 20}}>
              {`${titleVerb} $${amount}`}
            </Text>
            <Text style={{color: Theme.lightBlue, fontSize: 13}}>
              {`${title} ${involved}`}
            </Text>
          </View>
        </View>
        <View></View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  entry: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 90,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'black',
    paddingHorizontal: 15
  },
  image: {
    resizeMode: 'contain',
    height: 44,
    width: 44
  }
})

HistoryEntry.propTypes = {
  entry: PropTypes.shape({
    amount: PropTypes.string.isRequired,
    counter_party: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    transfer_type: PropTypes.string.isRequired
  })
}
