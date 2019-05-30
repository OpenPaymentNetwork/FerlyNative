import accounting from 'ferly/utils/accounting'
import PrimaryButton from 'ferly/components/PrimaryButton'
import PropTypes from 'prop-types'
import React from 'react'
import SimpleCurrencyInput from 'ferly/components/SimpleCurrencyInput'
import Spinner from 'ferly/components/Spinner'
import TestElement from 'ferly/components/TestElement'
import Theme from 'ferly/utils/theme'
import {apiExpire, apiRequire} from 'ferly/store/api'
import {connect} from 'react-redux'
import {format as formatDate} from 'date-fns'
import {urls} from 'ferly/utils/fetch'
import {View, Text, StyleSheet, Button} from 'react-native'

export class Purchase extends React.Component {
  static navigationOptions = {
    title: 'Purchase'
  };

  constructor (props) {
    super(props)
    this.state = {amount: 0, submitting: false, text: ''}
  }

  componentDidMount () {
    this.props.apiRequire(urls.profile)
  }

  onPurchase () {
    const {navigation} = this.props
    const params = navigation.state.params
    const {design} = params
    const amount = this.state.text
    navigation.navigate('Cart', {amount, design})
  }

  onChange (newAmount) {
    this.setState({text: newAmount})
  }

  render () {
    const {navigation} = this.props
    const {params} = this.props.navigation.state
    const {submitting, text} = this.state
    const {design} = params
    const {title} = design
    const amounts = this.props.amounts || []

    const found = amounts.find((cashRow) => {
      return cashRow.id === design.id
    })

    const foundAmount = found ? found.amount : 0
    const formatted = accounting.formatMoney(parseFloat(foundAmount))
    const fieldValue = accounting.formatMoney(parseFloat(text))

    const d = new Date()
    d.setDate(d.getDate() + 1825)
    const expirationDate = formatDate(d, 'M/D/YYYY')

    return (
      <View style={{flex: 1, justifyContent: 'space-between'}}>
        <View style={styles.contentContainer}>
          <View style={styles.topRow}>
            <View style={{flexShrink: 1, paddingVertical: 14}}>
              <Text style={styles.title}>{title}</Text>
              <Text style={{color: 'gray'}}>Balance: {formatted}</Text>
            </View>
            <TestElement
              parent={SimpleCurrencyInput}
              label='test-id-purchase-currency'
              onChangeText={this.onChange.bind(this)} />
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
          <Text style={styles.header}>Expiration and Fees</Text>
          <Text style={styles.paragraph}>
            Gift value expires {expirationDate}, five years after the date of
            purchase. Dormancy, inactivity, or service fees do not apply to
            purchased gift value.
          </Text>
          <Text style={styles.header}>Terms</Text>
          <Text style={styles.paragraph}>
            The purchase of this gift value is subject to the Ferly Cardholder
            and App Agreement and Ferly's Privacy Policy and Refund Policy.
            Please contact us at (800) 651-2186 for any questions.
          </Text>
        </View>
        {submitting ? <Spinner /> : null}
        <PrimaryButton
          title="Checkout"
          disabled={fieldValue === '$0.00' || submitting}
          onPress={this.onPurchase.bind(this)}
        />
      </View>
    )
  }
}

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
    fontSize: 22,
    paddingRight: 20
  },
  header: {
    color: Theme.lightBlue,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4
  },
  paragraph: {fontSize: 16,marginBottom: 10}
})

Purchase.propTypes = {
  amounts: PropTypes.array,
  apiExpire: PropTypes.func.isRequired,
  apiRequire: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  const apiStore = state.api.apiStore
  const {amounts} = apiStore[urls.profile] || {}

  return {
    amounts
  }
}

const mapDispatchToProps = {
  apiExpire,
  apiRequire
}

export default connect(mapStateToProps, mapDispatchToProps)(Purchase)
