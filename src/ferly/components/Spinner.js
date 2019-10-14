import React from 'react';
import {StyleSheet, View, ActivityIndicator} from 'react-native';

export default class Spinner extends React.Component {
  render () {
    return (
      <View style={styles.indicator}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  indicator: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row'
  }
});
