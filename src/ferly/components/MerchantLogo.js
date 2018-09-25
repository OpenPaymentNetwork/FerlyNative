import PropTypes from 'prop-types'
import React from 'react'
import {View, Image, StyleSheet} from 'react-native'

export default class MerchantLogo extends React.Component {
  render () {
    return (
      <View style={styles.card}>
        <Image style={styles.image} source={{uri: this.props.source}} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  card: {
    height: 68,
    width: 68
  },
  image: {
    borderRadius: 34,
    borderWidth: 0.5,
    borderColor: 'black',
    width: 68,
    height: 68
  }
})

MerchantLogo.propTypes = {
  source: PropTypes.string.isRequired
}
