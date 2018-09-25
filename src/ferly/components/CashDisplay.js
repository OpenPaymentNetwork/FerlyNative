import Icon from 'react-native-vector-icons/FontAwesome'
import MerchantLogo from 'ferly/components/MerchantLogo'
import PropTypes from 'prop-types'
import React from 'react'
import Theme from 'ferly/utils/theme'
import {Text, View, StyleSheet} from 'react-native'

export default class CashDisplay extends React.Component {
  renderCaret () {
    if (this.props.showCaret) {
      return (
        <Icon
          name="angle-right"
          color="black"
          size={28} />
      )
    }
  }

  render () {
    const design = this.props.design

    let amount
    if (design.amount) {
      amount = <Text style={{color: Theme.lightBlue}}>${design.amount}</Text>
    }
    return (
      <View style={styles.card}>
        <MerchantLogo source={design.url}/>
        <View style={{flex: 1, paddingHorizontal: 10}}>
          <Text style={{fontSize: 18, fontWeight: 'bold'}}>
            {design.title}
          </Text>
          {amount}
        </View>
        <View>
          {this.renderCaret()}
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    height: 90,
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 0.5,
    justifyContent: 'space-between',
    borderColor: 'black',
    paddingHorizontal: 15
  },
  image: {
    width: 68,
    height: 68,
    margin: 10
  }
})

CashDisplay.propTypes = {
  design: PropTypes.shape({
    amount: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired
  }),
  showCaret: PropTypes.bool
}
