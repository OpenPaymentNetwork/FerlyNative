import PropTypes from 'prop-types'
import React from 'react'
import {Text, View, StyleSheet} from 'react-native'

export default class StoreAvatar extends React.Component {
  render () {
    const {title, size, shade} = this.props
    const sizeStyle = {
      height: size,
      width: size,
      borderRadius: size / 2
    }

    if (title) {
      return (
        <View style={[styles.container, sizeStyle, shade && styles.shade]}>
          <Text style={{fontSize: 36, color: 'white'}}>
            {title.charAt(0)}
          </Text>
        </View>
      )
    }
    return null
  }
}
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  shade: {
    shadowOffset: {width: 0, height: 2},
    shadowColor: 'lightgray',
    shadowOpacity: 1
  }
})

StoreAvatar.propTypes = {
  title: PropTypes.string,
  shade: PropTypes.bool,
  size: PropTypes.number.isRequired
}
