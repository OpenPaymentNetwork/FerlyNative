import Icon from 'react-native-vector-icons/FontAwesome'
import PropTypes from 'prop-types'
import React from 'react'
import TestElement from 'ferly/components/TestElement'
import {TextInput, View, StyleSheet} from 'react-native'

export default class SearchBar extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      searchText: ''
    }
  }

  onChangeText (text) {
    this.setState({searchText: text})
    this.props.onChangeText(text)
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
          underlineColorAndroid='transparent'
          style={styles.input}
          onChangeText={this.onChangeText.bind(this)}
          value={this.state.searchText}
          placeholder={this.props.placeholder || 'Search'} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    maxHeight: 50,
    minHeight: 50,
    margin: 14,
    borderWidth: 1,
    borderColor: 'lightgray',
    elevation: 2,
    shadowOffset: {width: 2, height: 2},
    shadowColor: 'lightgray',
    shadowOpacity: 1
  },
  input: {
    flex: 1,
    fontSize: 18
  }
})

SearchBar.propTypes = {
  onChangeText: PropTypes.func.isRequired,
  placeholder: PropTypes.string
}
