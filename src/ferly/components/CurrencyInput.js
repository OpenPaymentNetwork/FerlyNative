import PropTypes from 'prop-types'
import React from 'react'
import {View, TextInput, Text} from 'react-native'
import accounting from 'ferly/utils/accounting'

export default class CurrencyInput extends React.Component {
  constructor (props) {
    super(props)
    this.amountChanged = this.amountChanged.bind(this)
    this.state = {
      text: ''
    }
  }

  amountChanged (newText) {
    this.setState({
      text: newText
    })
  }

  render () {
    const currentText = this.state.text
    const formattedValue = accounting.formatMoney(parseFloat(currentText) / 100)

    return (
      <View>
        <TextInput
          style={{display: 'none'}}
          ref='hiddenInput'
          keyboardType='numeric'
          returnKeyType='done'
          onChangeText={(newText) => this.setState({text: newText})}
          onSubmitEditing={
            () => this.props.callback(accounting.parse(formattedValue))}
          value={currentText} />
        <TextInput
          style={{textAlign: 'right'}}
          returnKeyType='done'
          keyboardType='numeric'
          onFocus={() => {
            this.setState({text: ''})
            this.refs.hiddenInput.focus()
          }}
          value={formattedValue} />
        <Text style={{color: 'red'}}>{this.props.error}</Text>
      </View>
    )
  }
}

CurrencyInput.propTypes = {
  callback: PropTypes.func.isRequired
}
