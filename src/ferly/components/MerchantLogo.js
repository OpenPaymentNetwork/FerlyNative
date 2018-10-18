import PropTypes from 'prop-types'
import React from 'react'
import {View, Image, StyleSheet} from 'react-native'

export default class MerchantLogo extends React.Component {
  render () {
    return (
      <View style={styles.container}>
        <Image style={styles.image} source={{uri: this.props.source}} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    height: 68,
    width: 68,
    borderRadius: 34,
    elevation: 4,
    shadowOffset: {width: 3, height: 3},
    shadowColor: 'lightgray',
    shadowOpacity: 1,
    backgroundColor: 'white'
  },
  image: {
    borderRadius: 34,
    borderWidth: 1,
    borderColor: 'lightgray',
    width: 68,
    height: 68
  }
})

MerchantLogo.propTypes = {
  source: PropTypes.string.isRequired
}
