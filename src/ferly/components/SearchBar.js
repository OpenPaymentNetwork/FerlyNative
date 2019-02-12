import Icon from 'react-native-vector-icons/FontAwesome'
import PropTypes from 'prop-types'
import React from 'react'
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
        <TextInput
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
    borderWidth: 9,
    borderColor: '#E4E4E4',
    maxHeight: 70
  },
  input: {
    flex: 1,
    fontSize: 22
  }
})

SearchBar.propTypes = {
  onChangeText: PropTypes.func.isRequired,
  placeholder: PropTypes.string
}
