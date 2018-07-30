import PropTypes from 'prop-types'
import React from 'react'
import {Text} from 'react-native'

export default class HistoryEntry extends React.Component {
  render () {
    const {entry} = this.props
    const {amount, title, timestamp} = entry
    const transferType = entry.transfer_type
    const counterParty = entry.counter_party

    let text
    const time = new Date(timestamp).toLocaleDateString()
    switch (transferType) {
      case 'purchase':
        text = `You purchased $${amount} ${title} on ${time}`
        break
      case 'send':
        text = `You gave $${amount} ${title} to ${counterParty} on ${time}`
        break
      case 'receive':
        text = (
          `You received $${amount} ${title} from ${counterParty} on ${time}`)
        break
      case 'redeem':
        text = `You redeemed $${amount} ${title} on ${time}`
        break
    }

    return (
      <Text>
        {text}
      </Text>
    )
  }
}

HistoryEntry.propTypes = {
  entry: PropTypes.shape({
    amount: PropTypes.string.isRequired,
    counter_party: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    transfer_type: PropTypes.string.isRequired
  })
}
