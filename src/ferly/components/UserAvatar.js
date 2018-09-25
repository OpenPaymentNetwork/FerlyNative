import PropTypes from 'prop-types'
import React from 'react'
import {Text, View, Image, StyleSheet} from 'react-native'

export default class UserAvatar extends React.Component {
  render () {
    const {title, profileImage} = this.props

    let render
    if (profileImage) {
      return <Image style={styles.image} source={{uri: profileImage}} />
    }

    if (title && !render) {
      return (
        <View style={styles.container}>
          <Text style={{fontSize: 32, color: 'gray'}}>
            {title.charAt(0) + title.charAt(title.indexOf(' ') + 1)}
          </Text>
        </View>
      )
    }
    return null
  }
}

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'lightgray',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50
  }
})

UserAvatar.propTypes = {
  title: PropTypes.string,
  profileImage: PropTypes.string
}
