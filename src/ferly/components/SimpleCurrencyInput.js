import PropTypes from 'prop-types';
import React from 'react';
import TestElement from 'ferly/components/TestElement';
import {Text, View, StyleSheet, TextInput, Dimensions} from 'react-native';

export default class SimpleCurrencyInput extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      text: ''
    };
  }

  onChange (newText) {
    this.props.onChangeText(newText);
    this.setState({text: newText});
  }

  render () {
    return (
      <View>
        <View style={styles.inputContainer}>
          <Text style={styles.dollarSign}>$</Text>
          <TestElement
            parent={TextInput}
            label='test-id-currency-input'
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
    );
  }
}

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  input: {
    fontSize: width > 600 ? 24 : 22,
    fontWeight: 'bold',
    height: width > 600 ? 70 : 65,
    marginLeft: 4,
    textAlign: 'right',
    minWidth: width > 600 ? 35 : 30
  },
  inputContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexGrow: 1
  },
  dollarSign: {
    flexGrow: 1,
    fontSize: width > 600 ? 26 : 24,
    fontWeight: 'bold',
    height: width > 600 ? 70 : 65,
    paddingTop: 16,
    textAlign: 'right'
  },
  error: {
    color: 'red',
    textAlign: 'right',
    width: 100
  }
});

SimpleCurrencyInput.propTypes = {
  error: PropTypes.string,
  onChangeText: PropTypes.func.isRequired
};
