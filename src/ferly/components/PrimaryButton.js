import PropTypes from 'prop-types'
import React from 'react'
import Theme from 'ferly/utils/theme'
import {Text, TouchableOpacity} from 'react-native'

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
          justifyContent: 'center',
          borderRadius: 15,
          marginHorizontal: 15,
          marginBottom: 25
        }}
        disabled={disabled}
        onPress={() => onPress()}>
        <Text style={{color: 'white', fontSize: 20}}>{title}</Text>
      </TouchableOpacity>
    )
  }
}

PrimaryButton.propTypes = {
  disabled: PropTypes.bool,
  onPress: PropTypes.func.isRequired,
  title: PropTypes.string
}
