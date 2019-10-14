import PropTypes from 'prop-types';
import React from 'react';
import {Platform} from 'react-native';

export default class TestElement extends React.Component {
  render () {
    const {parent: Parent, label, children, ...otherProps} = this.props;
    let labelProp;
    if (Platform.OS === 'ios') {
      labelProp = {testID: label};
    } else {
      labelProp = {accessibilityLabel: label};
    }
    return (
      <Parent {...labelProp} {...otherProps}>
        {children}
      </Parent>
    );
  }
}

TestElement.propTypes = {
  label: PropTypes.string.isRequired,
  parent: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object
  ]).isRequired,
  children: PropTypes.node
};
