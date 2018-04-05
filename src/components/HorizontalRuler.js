import React from 'react';
import { Text, View, Image, StyleSheet } from 'react-native';

export default class HorizontalRuler extends React.Component {

  render() {
    return (
      <View style={{
          borderWidth: 0.5,
          borderColor: this.props.color || 'black',
          marginVertical: 10}} />
    );
  }
}
