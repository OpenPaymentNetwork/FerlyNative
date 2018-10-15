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
    // const design = this.props.design

    return (
      <View>
        <View style={{flexGrow: 1, flexDirection: 'row', alignItems: 'flex-start'}}>
          <Text style={{flexGrow: 1, textAlign: 'right', height: 65, paddingTop: 16, fontSize: 24, fontWeight: 'bold'}}>$</Text>
          <TextInput
            style={{textAlign: 'right', height: 65, fontSize: 22, fontWeight: 'bold', marginLeft: 4}}
            returnKeyType='done'
            keyboardType='numeric'
            underlineColorAndroid='transparent'
            maxLength={10}
            onChangeText={(newText) => this.onChange(newText)}
            autoFocus
            value={this.state.text} />
        </View>
        <Text style={{color: 'red', width: '100%', textAlign: 'right'}}>
          {this.props.error}
        </Text>
      </View>
    )
  }
}

// const styles = StyleSheet.create({
//   card: {
//     flexDirection: 'row',
//     height: 90,
//     alignItems: 'center',
//     backgroundColor: '#FFF',
//     borderWidth: 0.5,
//     justifyContent: 'space-between',
//     borderColor: 'black',
//     paddingHorizontal: 15
//   },
//   image: {
//     width: 68,
//     height: 68,
//     margin: 10
//   }
// })

// SimpleCurrencyInput.propTypes = {
//   design: PropTypes.shape({
//     amount: PropTypes.string.isRequired,
//     id: PropTypes.number.isRequired,
//     title: PropTypes.string.isRequired,
//     url: PropTypes.string.isRequired
//   }),
//   showCaret: PropTypes.bool
// }
