import ProfileDisplay from '../components/ProfileDisplay'
import React from 'react';
import {DrawerItems} from 'react-navigation'
import {ScrollView, Text, SafeAreaView, StyleSheet, TouchableOpacity} from 'react-native'

export class DrawerContent extends React.Component {
  render() {
    const { items, ...otherProps } = this.props;
    const filteredItems = items.filter(item => item.key !== "Profile")
    return (
      <ScrollView>
        <SafeAreaView style={styles.container} forceInset={{ top: 'always', horizontal: 'never' }}>
          <TouchableOpacity onPress={() => this.props.navigation.navigate('Profile')}>
            <ProfileDisplay name={'Drawer Profile'} url={'http://simpleicon.com/wp-content/uploads/drawer.png'} />
          </TouchableOpacity>
          <DrawerItems items={filteredItems} {...otherProps} />
        </SafeAreaView>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
