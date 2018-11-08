import FerlyCard from 'ferly/views/FerlyCard'
import GiftCard from 'ferly/views/Wallet/GiftCard'
import Give from 'ferly/views/Give/Give'
import Search from 'ferly/views/Give/Search'
import History from 'ferly/views/History'
import Icon from 'react-native-vector-icons/FontAwesome'
import Profile from 'ferly/views/Profile'
import React from 'react'
import Settings from 'ferly/views/Settings/Settings'
import SignUp from 'ferly/views/SignUp'
import Home from 'ferly/views/Wallet/Home'
import Cart from 'ferly/views/Purchase/Cart'
import Purchase from 'ferly/views/Purchase/Purchase'
import Market from 'ferly/views/Purchase/Market'
import Recovery from 'ferly/views/Settings/Recovery'
import BrainTree from 'ferly/views/Purchase/BrainTree'
import {
  createDrawerNavigator,
  createStackNavigator,
  createSwitchNavigator
} from 'react-navigation'
import DrawerContent from 'ferly/components/Drawer'
import Theme from 'ferly/utils/theme'

const drawerOptions = ({navigation}) => ({
  headerRight: (
    <Icon
      name="bars"
      color="white"
      size={26}
      onPress={() => navigation.toggleDrawer()} />
  ),
  headerStyle: {paddingRight: 20, backgroundColor: Theme.darkBlue},
  headerTintColor: 'white'
})

const ProfileStack = createStackNavigator({
  Profile: {screen: Profile, navigationOptions: drawerOptions}
})

const WalletStack = createStackNavigator(
  {
    Home: {screen: Home, navigationOptions: drawerOptions},
    Give: {screen: Search, navigationOptions: drawerOptions},
    Cash: {screen: GiftCard, navigationOptions: drawerOptions},
    Amount: {screen: Give, navigationOptions: drawerOptions},
    Market: {screen: Market, navigationOptions: drawerOptions},
    Purchase: {screen: Purchase, navigationOptions: drawerOptions},
    Cart: {screen: Cart, navigationOptions: drawerOptions},
    BrainTree: {screen: BrainTree, navigationOptions: drawerOptions}
  },
  {
    initialRouteName: 'Home'
  }
)

const SettingsStack = createStackNavigator(
  {
    Settings: {screen: Settings, navigationOptions: drawerOptions},
    Recovery: {screen: Recovery, navigationOptions: drawerOptions}
  },
  {
    initialRouteName: 'Settings'
  }
)

const AuthDrawer = createDrawerNavigator(
  {
    Wallet: WalletStack,
    Profile: ProfileStack,
    'Ferly Card': createStackNavigator(
      {Card: {screen: FerlyCard, navigationOptions: drawerOptions}}),
    History: createStackNavigator(
      {History: {screen: History, navigationOptions: drawerOptions}}),
    Settings: SettingsStack
  },
  {
    drawerPosition: 'right',
    contentComponent: DrawerContent
  }
)

// const PubStack = createStackNavigator(
//   {
//     Info: {screen: SignUp}
//   },
//   {
//     initialRouteName: 'Info'
//   }
// )

export const CreateAuthSwitch = (props) => {
  const AppLayout = createSwitchNavigator(
    {
      Pub: SignUp,
      Auth: AuthDrawer
    },
    {
      initialRouteName: props ? 'Auth' : 'Pub'
    })
  return AppLayout
}

export default CreateAuthSwitch
