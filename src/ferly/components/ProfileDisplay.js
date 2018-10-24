import PropTypes from 'prop-types'
import React from 'react'
import {Text, View, Image, StyleSheet} from 'react-native'

export default class ProfileDisplay extends React.Component {
  render () {
    const {name, url, username} = this.props

    let img
    if (url) {
      img = <Image style={styles.image} source={{uri: url}} />
    } else {
      img = (
        <View style={styles.container}>
          <Text style={{fontSize: 32, color: 'gray'}}>
            {name.charAt(0) + name.charAt(name.indexOf(' ') + 1)}
          </Text>
        </View>
      )
    }

    return (
      <View marginVertical={10} style={{flexDirection: 'row'}}>
        <View style={{marginHorizontal: 10}}>
          {img}
        </View>
        <View style={{justifyContent: 'center', flex: 1}}>
          <Text style={{fontSize: 24}}>
            {name}
          </Text>
          <Text style={{fontSize: 20, color: 'gray'}}>
            {'@' + username}
          </Text>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  image: {
    width: 68,
    height: 68,
    borderRadius: 34
  },
  container: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'lightgray',
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})

ProfileDisplay.propTypes = {
  name: PropTypes.string,
  username: PropTypes.string,
  url: PropTypes.string
}
