import PropTypes from 'prop-types'
import React from 'react'
import {View} from 'react-native'

export default class HorizontalRuler extends React.Component {
  render () {
    return (
      <View style={{
        borderWidth: 0.5,
        borderColor: this.props.color || 'black',
        marginVertical: 10}} />
    )
  }
}

HorizontalRuler.propTypes = {
  color: PropTypes.string
}
