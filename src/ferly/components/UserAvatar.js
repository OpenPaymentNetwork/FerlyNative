import PropTypes from 'prop-types'
import React from 'react'
import {Text, View, Image, StyleSheet} from 'react-native'

export default class UserAvatar extends React.Component {
  render () {
    const {firstName, lastName, profileImage} = this.props

    let render
    if (profileImage) {
      return <Image style={styles.image} source={{uri: profileImage}} />
    }

    if (firstName && !render) {
      return (
        <View style={styles.container}>
          <Text style={{fontSize: 32, color: 'gray'}}>
            {firstName.charAt(0) + lastName.charAt(0)}
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
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  profileImage: PropTypes.string
}
