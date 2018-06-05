import FerlyCardScreen from './views/card'
import GiftCardScreen from './views/GiftCard'
import GiveScreen from './views/give'
import History from './views/history'
import Icon from 'react-native-vector-icons/FontAwesome'
import ProfileScreen from './views/profile'
import React from 'react'
import WalletScreen from './views/wallet'
import {createDrawerNavigator, createStackNavigator, DrawerItems} from 'react-navigation'
import {custom, DrawerContent} from './components/Drawer'
import {ScrollView, Text} from 'react-native'

const drawerOptions = ({navigation}) => ({
  headerRight: (
    <Icon
      name="bars"
      size={26}
      onPress={() => navigation.toggleDrawer()} />
  ),
  headerStyle: {paddingRight: 20}
})

const ProfileStack = createStackNavigator({
  Profile: {screen: ProfileScreen, navigationOptions: drawerOptions}
})

const Stack = createStackNavigator(
  {
    Wallet: {screen: WalletScreen, navigationOptions: drawerOptions},
    Give: {screen: GiveScreen, navigationOptions: drawerOptions},
    Cash: {screen: GiftCardScreen, navigationOptions: drawerOptions}
  },
  {
    initialRouteName: 'Wallet'
  }
)

const Drawer = createDrawerNavigator(
  {
    Wallet: Stack,
    Profile: ProfileStack,
    Card: createStackNavigator(
      {Card: {screen: FerlyCardScreen, navigationOptions: drawerOptions}}),
    History: createStackNavigator(
      {History: {screen: History, navigationOptions: drawerOptions}})
  },
  {
    drawerPosition: 'right',
    contentComponent: DrawerContent
  }
)

export default Drawer
