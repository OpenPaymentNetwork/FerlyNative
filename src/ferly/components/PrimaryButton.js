import PropTypes from 'prop-types';
import React from 'react';
import Theme from 'ferly/utils/theme';
import {Text, TouchableOpacity, Dimensions} from 'react-native';

export default class PrimaryButton extends React.Component {
  render () {
    const {title, onPress, disabled, marginHorizontal} = this.props;
    return (
      <TouchableOpacity
        style={{
          alignItems: 'center',
          backgroundColor: disabled ? 'lightgray' : Theme.lightBlue,
          flexDirection: 'row',
          height: width > 600 ? 60 : 50,
          justifyContent: 'center',
          borderRadius: 15,
          marginHorizontal: marginHorizontal || 15,
          marginBottom: 25
        }}
        disabled={disabled}
        onPress={() => onPress()}>
        <Text
          allowFontScaling={false}
          style={{color: Theme.darkBlue, fontSize: width > 600 ? 24 : 20}}>{title}</Text>
      </TouchableOpacity>
    );
  }
}

let {width} = Dimensions.get('window');

PrimaryButton.propTypes = {
  disabled: PropTypes.bool,
  onPress: PropTypes.func.isRequired,
  title: PropTypes.string,
  marginHorizontal: PropTypes.number
};
