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

  validateText (newAmount) {
    if (newAmount.match(/^\d*\.?\d*$/)) {
      if (newAmount.includes('.')) {
        let arr = newAmount.split('.');
        if (arr.length > 2) {
          return false;
        }
        let secondArr = arr[1];
        if (secondArr.includes('.')) {
          return false;
        } else if (secondArr.length > 2) {
          return false;
        } else {
          return true;
        }
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  onChange (newText) {
    if (this.validateText(newText)) {
      this.setState({text: newText});
      this.props.onChangeText(newText);
    } else {
      return null;
    }
  }

  render () {
    return (
      <View>
        <View style={styles.inputContainer}>
          <Text
            allowFontScaling={false}
            style={styles.dollarSign}>$</Text>
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
        <Text
          allowFontScaling={false}
          style={styles.error}>
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
