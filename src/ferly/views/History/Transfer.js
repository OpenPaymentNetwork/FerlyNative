// import Icon from 'react-native-vector-icons/FontAwesome'
import PropTypes from 'prop-types'
import React from 'react'
import Avatar from 'ferly/components/Avatar'
// import Spinner from 'ferly/components/Spinner'
// import Theme from 'ferly/utils/theme'
import {apiRequire} from 'ferly/store/api'
import {connect} from 'react-redux'
import {createUrl} from 'ferly/utils/fetch'
import {View, Text} from 'react-native'
import {format as formatDate} from 'date-fns'

export class Transfer extends React.Component {
  static navigationOptions = {
    title: 'Transaction'
  };

  componentDidMount () {
    this.props.apiRequire(this.props.transferUrl)
  }

  render () {
    const {transferDetails} = this.props
    const {amount, message, timestamp, id} = transferDetails
    const designTitle = transferDetails.design_title
    const counterParty = transferDetails.counter_party
    const counterPartyImageUrl = transferDetails.counter_party_image_url
    const transferType = transferDetails.transfer_type
    const designImageUrl = transferDetails.design_image_url
    const b = timestamp.split(/\D+/)
    const date = new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5]))
    // React Native doesn't fully support Date.toLocaleString() on Android
    // use date-fns. Expect the JavaScriptCore to be updated in SDK 31.
    const dateDisplay = formatDate(date, 'MMM D, YYYY h:mm A')

    let verb = ''
    let cp = ''
    switch (transferType) {
      case 'purchase':
        verb = 'added'
        break
      case 'send':
        verb = 'gifted'
        cp = ` to ${counterParty}`
        break
      case 'receive':
        verb = 'received'
        cp = ` from ${counterParty}`
        break
      case 'redeem':
        verb = 'paid'
        break
    }
    let msg = ''
    if (message) {
      msg = ` with the message: "${message}"`
    }
    const desc = (
      `You ${verb} $${amount} ${designTitle}${cp} on ${dateDisplay}${msg}`)

    return (
      <View style={{flex: 1}}>
        <View style={{height: 90, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center'}}>
          <Text style={{fontSize: 28}}>${amount}</Text>
          <Avatar size={68} shade={true} pictureUrl={designImageUrl}/>
          <Avatar size={68} shade={true} firstWord={counterParty} pictureUrl={counterPartyImageUrl} />
        </View>
        <View style={{flexGrow: 1}}>
          <Text>{desc}</Text>
        </View>
        <View style={{flexDirection: 'row-reverse'}}>
          <Text style={{color: 'darkgray'}}>{id}</Text>
        </View>
      </View>
    )
  }
}

Transfer.propTypes = {
  apiRequire: PropTypes.func.isRequired,
  transferDetails: PropTypes.object.isRequired,
  transferUrl: PropTypes.string.isRequired
}

function mapStateToProps (state, ownProps) {
  const transfer = ownProps.navigation.state.params
  const transferUrl = createUrl('transfer', {transfer_id: transfer.id})
  const apiStore = state.api.apiStore
  const details = apiStore[transferUrl] || {}
  const transferDetails = {...transfer, ...details}
  return {
    transferDetails,
    transferUrl
  }
}

const mapDispatchToProps = {
  apiRequire
}

export default connect(mapStateToProps, mapDispatchToProps)(Transfer)
