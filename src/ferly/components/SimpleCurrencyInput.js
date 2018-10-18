import PropTypes from 'prop-types'
import React from 'react'
import {Text, View, StyleSheet, TextInput} from 'react-native'

export default class SimpleCurrencyInput extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      text: ''
    }
  }

  onChange (newText) {
    this.props.onChangeText(newText)
    this.setState({text: newText})
  }

  render () {
    return (
      <View>
        <View style={styles.inputContainer}>
          <Text style={styles.dollarSign}>$</Text>
          <TextInput
            style={styles.input}
            returnKeyType='done'
            keyboardType='numeric'
            underlineColorAndroid='transparent'
            maxLength={10}
            onChangeText={(newText) => this.onChange(newText)}
            autoFocus
            value={this.state.text} />
        </View>
        <Text style={styles.error}>
          {this.props.error}
        </Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  input: {
    fontSize: 22,
    fontWeight: 'bold',
    height: 65,
    marginLeft: 4,
    textAlign: 'right'
  },
  inputContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexGrow: 1
  },
  dollarSign: {
    flexGrow: 1,
    fontSize: 24,
    fontWeight: 'bold',
    height: 65,
    paddingTop: 16,
    textAlign: 'right'
  },
  error: {
    color: 'red',
    textAlign: 'right',
    width: '100%'
  }
})

SimpleCurrencyInput.propTypes = {
  error: PropTypes.string,
  onChangeText: PropTypes.func.isRequired
}
