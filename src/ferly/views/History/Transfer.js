import accounting from 'ferly/utils/accounting'
import PropTypes from 'prop-types'
import React from 'react'
import Avatar from 'ferly/components/Avatar'
import Theme from 'ferly/utils/theme'
import {apiRequire} from 'ferly/store/api'
import {connect} from 'react-redux'
import {createUrl} from 'ferly/utils/fetch'
import {View, Text, ScrollView, StyleSheet} from 'react-native'
import {format as formatDate} from 'date-fns'

export class Transfer extends React.Component {
  static navigationOptions = ({navigation}) => ({
    title: `${navigation.state.params.title}`
  });

  componentDidMount () {
    this.props.apiRequire(this.props.transferUrl)
  }

  render () {
    const {transferDetails} = this.props
    const {
      amount,
      message,
      timestamp,
      design_title: designTitle,
      counter_party: counterParty,
      counter_party_profile_image_url: counterPartyProfileImageUrl,
      transfer_type: transferType,
      design_logo_image_url: designLogoImageUrl,
      convenience_fee: convenienceFee = 0,
      cc_last4: lastFour = '****',
      cc_brand: lowerBrand = ''
    } = transferDetails
    const total = parseFloat(amount) + parseFloat(convenienceFee)
    const brand = lowerBrand.charAt(0).toUpperCase() + lowerBrand.substring(1)
    const b = timestamp.split(/\D+/)
    const date = new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5]))
    // React Native doesn't fully support Date.toLocaleString() on Android
    // use date-fns. Expect the JavaScriptCore to be updated in SDK 31.
    const dateDisplay = formatDate(date, 'MMM D, YYYY h:mm A')

    let verb = ''
    let cp = ''
    let messageTitle = ''
    switch (transferType) {
      case 'purchase':
        verb = 'added'
        cp = ' to your Wallet'
        break
      case 'send':
        verb = 'gifted'
        cp = ` to ${counterParty}`
        messageTitle = 'Your '
        break
      case 'receive':
        verb = 'received'
        cp = ` from ${counterParty}`
        messageTitle = 'Their '
        break
      case 'redeem':
        verb = 'paid'
        break
    }

    let counterPartyAvatar
    if (transferType === 'send' || transferType === 'receive') {
      counterPartyAvatar = (
        <View style={{marginLeft: -20, zIndex: -1}}>
          <Avatar
            size={100}
            firstWord={counterParty}
            pictureUrl={counterPartyProfileImageUrl} />
        </View>
      )
    }

    let messageSection
    if (message) {
      messageSection = (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>
            {`${messageTitle}Message:`}
          </Text>
          <Text
            style={{fontSize: 18, color: Theme.lightBlue, paddingLeft: 20}}>
            {message}
          </Text>
        </View>
      )
    }

    let purchaseDetailsSection
    let termsSection
    let paymentSection
    let feesSection
    if (transferType === 'purchase') {
      purchaseDetailsSection = (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Purchase Details</Text>
          <View style={{paddingLeft: 20}}>
            <View style={styles.functionRow}>
              <Text style={styles.sectionText}>Purchase Amount</Text>
              <Text style={[styles.sectionText, {color: Theme.lightBlue}]}>
                ${amount}
              </Text>
            </View>
            <View style={styles.functionRow}>
              <Text style={styles.sectionText}>Convenience Fee</Text>
              <Text style={[styles.sectionText, {color: Theme.lightBlue}]}>
                {accounting.formatMoney(convenienceFee)}
              </Text>
            </View>
            <View style={[
              styles.functionRow,
              {borderBottomWidth: 0.5, borderColor: 'darkgray'}
            ]}>
              <Text style={styles.sectionText}>Tax</Text>
              <Text style={[styles.sectionText, {color: Theme.lightBlue}]}>
                $0.00
              </Text>
            </View>
            <View style={styles.functionRow}>
              <Text style={styles.sectionText}>Total</Text>
              <Text style={[styles.sectionText, {color: Theme.lightBlue}]}>
                {accounting.formatMoney(total)}
              </Text>
            </View>
          </View>
        </View>
      )
      termsSection = (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Terms</Text>
          <View style={{paddingLeft: 20}}>
            <Text style={styles.sectionText}>
              The payment for your purchase was processed by Ferly, Inc. 481
              E 1000 S, STE B, Pleasant Grove, UT 84062.
            </Text>
            <View style={{height: 8}} />
            <Text style={styles.sectionText}>
              {'The purchase of this gift value is subject to Ferly\'s ' +
               'Privacy Policy, Refund Policy, and Cardholder Agreement.'}
            </Text>
            <View style={{height: 8}} />
            <Text style={styles.sectionText}>
              If you need more information, please contact (801) 792-2358.
            </Text>
          </View>
        </View>
      )
      paymentSection = (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Payment Method</Text>
          <View style={[styles.functionRow, {padding: 20}]}>
            <Text style={styles.sectionText}>{brand} Card</Text>
            <Text style={[styles.sectionText, {color: Theme.lightBlue}]}>
              ************{lastFour}
            </Text>
          </View>
        </View>
      )
      const d = new Date()
      d.setDate(d.getDate() + 1825)
      const expirationDate = formatDate(d, 'MMM D, YYYY')
      feesSection = (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Expiration & Fees</Text>
          <View style={[styles.functionRow, {paddingLeft: 20}]}>
            <Text style={styles.sectionText}>Expiration Date</Text>
            <Text style={[styles.sectionText, {color: Theme.lightBlue}]}>
              {expirationDate}
            </Text>
          </View>
          <View style={[styles.functionRow, {paddingLeft: 20}]}>
            <Text style={styles.sectionText}>Dormancy/Inactivity Fee</Text>
            <Text style={[styles.sectionText, {color: Theme.lightBlue}]}>
              None
            </Text>
          </View>
          <View style={[styles.functionRow, {paddingLeft: 20}]}>
            <Text style={styles.sectionText}>Service Fee</Text>
            <Text style={[styles.sectionText, {color: Theme.lightBlue}]}>
              None
            </Text>
          </View>
        </View>
      )
    }
    return (
      <ScrollView style={{backgroundColor: 'white'}}>
        <View style={{
          alignItems: 'center',
          flexDirection: 'row',
          height: 110,
          justifyContent: 'center'
        }}>
          <Avatar size={100} shade={true} pictureUrl={designLogoImageUrl}/>
          {counterPartyAvatar}
        </View>
        <View style={{
          alignItems: 'center',
          borderBottomWidth: 1,
          borderColor: 'darkgray',
          marginHorizontal: 20,
          paddingBottom: 10
        }}>
          <Text style={{textAlign: 'center', fontSize: 22}}>
            {`You ${verb} ${designTitle}${cp}.`}
          </Text>
          <View style={styles.spacer} />
          <Text style={{color: Theme.lightBlue, fontSize: 22}}>
            ${amount}
          </Text>
          <View style={styles.spacer} />
          <Text style={styles.sectionText}>
            {dateDisplay}
          </Text>
        </View>
        {messageSection}
        {purchaseDetailsSection}
        {paymentSection}
        {feesSection}
        {termsSection}
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  functionRow: {flexDirection: 'row', justifyContent: 'space-between'},
  section: {marginTop: 10, paddingHorizontal: 20},
  sectionHeader: {fontSize: 18},
  sectionText: {color: 'darkgray', fontSize: 16}
})

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
