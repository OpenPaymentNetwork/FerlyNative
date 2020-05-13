import Icon from 'react-native-vector-icons/FontAwesome';
import PropTypes from 'prop-types';
import React from 'react';
import TestElement from 'ferly/components/TestElement';
import {TextInput, View, StyleSheet, Dimensions} from 'react-native';

export default class SearchBar extends React.Component {
  onChangeText (text) {
    this.props.onChangeText(text);
    if (this.props.value) {
      return this.props.value;
    } else {
      return text;
    }
  }

  render () {
    return (
      <View style={styles.container}>
        <Icon
          name="search"
          color="black"
          style={{paddingHorizontal: 12}}
          size={20} />
        <TestElement
          parent={TextInput}
          label='test-id-search'
          allowFontScaling={false}
          underlineColorAndroid='transparent'
          style={styles.input}
          onChangeText={this.onChangeText.bind(this)}
          value={this.props.value}
          placeholder={this.props.placeholder || 'Search'} />
      </View>
    );
  }
}

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    maxHeight: width > 600 ? 65 : 50,
    minHeight: width > 600 ? 65 : 50,
    margin: width > 600 ? 18 : 14,
    borderWidth: 1,
    borderColor: 'lightgray',
    elevation: 2,
    shadowOffset: {width: 2, height: 2},
    shadowColor: 'lightgray',
    shadowOpacity: 1
  },
  input: {
    flex: 1,
    fontSize: width > 600 ? 22 : 18
  }
});

SearchBar.propTypes = {
  onChangeText: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string
};
