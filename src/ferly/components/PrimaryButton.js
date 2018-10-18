import PropTypes from 'prop-types'
import React from 'react'
import Theme from 'ferly/utils/theme'
import {Text, StyleSheet, TouchableOpacity} from 'react-native'

export default class PrimaryButton extends React.Component {
  render () {
    const {title, onPress, disabled} = this.props
    return (
      <TouchableOpacity
        style={{
          alignItems: 'center',
          backgroundColor: disabled ? 'lightgray' : Theme.lightBlue,
          flexDirection: 'row',
          height: 50,
          justifyContent: 'center'
        }}
        disabled={disabled}
        onPress={() => onPress()}
      >
        <Text style={styles.title}>{title}</Text>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  // container: {
  //   alignItems: 'center',
  //   backgroundColor: Theme.lightBlue,
  //   flexDirection: 'row',
  //   // flexGrow: 1,
  //   height: 50,
  //   justifyContent: 'center'
  // },
  title: {
    color: 'white',
    fontSize: 20
  }
})

PrimaryButton.propTypes = {
  disabled: PropTypes.bool,
  onPress: PropTypes.func.isRequired,
  title: PropTypes.string
}
