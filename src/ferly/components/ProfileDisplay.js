import PropTypes from 'prop-types'
import React from 'react'
import {Text, View, Image, StyleSheet} from 'react-native'

export default class ProfileDisplay extends React.Component {
  render () {
    const {name, url} = this.props
    return (
      <View marginVertical={10} style={{flexDirection: 'row'}}>
        <Image style={styles.image} source={{uri: url}} />
        <View style={{justifyContent: 'center', flex: 1}}>
          <Text style={{fontSize: 36}}>
            {name}
          </Text>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  image: {
    width: 80,
    height: 80,
    marginRight: 20,
    borderRadius: 20
  }
})

ProfileDisplay.propTypes = {
  name: PropTypes.string,
  url: PropTypes.string
}
