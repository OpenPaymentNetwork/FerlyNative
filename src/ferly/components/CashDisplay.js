import PropTypes from 'prop-types'
import React from 'react'
import {Text, View, Image, StyleSheet} from 'react-native'

export default class CashDisplay extends React.Component {
  render () {
    const design = this.props.design

    let amount
    if (design.amount) {
      amount = (
        <View style={{justifyContent: 'center', flex: 1}}>
          <Text style={{textAlign: 'center'}}>
            ${design.amount}
          </Text>
        </View>
      )
    }

    return (
      <View style={{flexDirection: 'row', marginVertical: 10}}>
        <View style={styles.card}>
          <Image style={styles.image} source={{uri: design.url}} />
          <Text style={{width: 80, textAlign: 'center', marginTop: 32}}>
            {design.title}
          </Text>
        </View>
        {amount}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    height: 90,
    backgroundColor: '#FFF',
    borderWidth: 0.5,
    borderColor: 'black',
    borderRadius: 10
  },
  image: {
    width: 68,
    height: 68,
    margin: 10
  }
})

CashDisplay.propTypes = {
  design: PropTypes.shape({
    amount: PropTypes.string,
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired
  })
}
