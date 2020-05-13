import PropTypes from 'prop-types';
import React from 'react';
import {Text, View, Image, StyleSheet} from 'react-native';

export default class Avatar extends React.Component {
  render () {
    const {firstWord, secondWord, pictureUrl, size, shade} = this.props;

    const sizeStyle = {
      height: size,
      width: size,
      borderRadius: size / 2
    };

    if (pictureUrl) {
      return (
        <View
          style={[sizeStyle, shade && styles.shade, styles.imageContainer]}>
          <Image
            style={[sizeStyle, shade && styles.imageShade]}
            source={{uri: pictureUrl}} />
        </View>
      );
    } else {
      const firstInitial = firstWord ? firstWord.charAt(0) : '';
      const lastInitial = secondWord ? secondWord.charAt(0) : '';
      return (
        <View
          style={[sizeStyle, styles.initialsContainer, shade && styles.shade]}>
          <Text
            allowFontScaling={false}
            style={{fontSize: 28, color: 'gray'}}>
            {firstInitial + lastInitial}
          </Text>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  initialsContainer: {
    backgroundColor: 'lightgray',
    justifyContent: 'center',
    alignItems: 'center'
  },
  shade: {
    elevation: 4,
    shadowOffset: {width: 0, height: 2},
    shadowColor: 'lightgray',
    shadowOpacity: 1
  },
  imageContainer: {
    backgroundColor: 'white'
  },
  imageShade: {
    borderWidth: 1,
    borderColor: 'lightgray'
  }
});

Avatar.propTypes = {
  firstWord: PropTypes.string,
  shade: PropTypes.bool,
  pictureUrl: PropTypes.string,
  secondWord: PropTypes.string,
  size: PropTypes.number.isRequired // Preferrably a number divisible by 2.
};
