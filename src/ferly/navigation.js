import Contact from 'ferly/views/Invitations/Contact'
import Contacts from 'ferly/views/Invitations/Contacts'
import FerlyCard from 'ferly/views/FerlyCard'
import GiftCard from 'ferly/views/Wallet/GiftCard'
import Give from 'ferly/views/Give/Give'
import Search from 'ferly/views/Give/Search'
import History from 'ferly/views/History'
import Invitations from 'ferly/views/Invitations/Invitations'
import Icon from 'react-native-vector-icons/FontAwesome'
import ManualAdd from 'ferly/views/Invitations/ManualAdd'
import Profile from 'ferly/views/Profile'
import React from 'react'
import RecoveryChannel from 'ferly/views/Public/RecoveryChannel'
import RecoveryCode from 'ferly/views/Public/RecoveryCode'
import Settings from 'ferly/views/Settings/Settings'
import SignUp from 'ferly/views/Public/SignUp'
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

const InvitationsStack = createStackNavigator(
  {
    Invitations: {screen: Invitations, navigationOptions: drawerOptions},
    Contacts: {screen: Contacts, navigationOptions: drawerOptions},
    ManualAdd: {screen: ManualAdd, navigationOptions: drawerOptions},
    Contact: {screen: Contact, navigationOptions: drawerOptions}
  },
  {
    initialRouteName: 'Invitations'
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
    Invitations: InvitationsStack,
    Settings: SettingsStack
  },
  {
    drawerPosition: 'right',
    contentComponent: DrawerContent
  }
)

const publicHeader = {
  headerStyle: {backgroundColor: Theme.darkBlue},
  headerTintColor: 'white'
}

const PubStack = createStackNavigator(
  {
    SignUp: {screen: SignUp, navigationOptions: {header: null}},
    RecoveryCode: {screen: RecoveryCode, navigationOptions: publicHeader},
    RecoveryChannel: {screen: RecoveryChannel, navigationOptions: publicHeader}
  },
  {
    initialRouteName: 'SignUp'
  }
)

export const CreateAuthSwitch = (props) => {
  const AppLayout = createSwitchNavigator(
    {
      Pub: PubStack,
      Auth: AuthDrawer
    },
    {
      initialRouteName: props ? 'Auth' : 'Pub'
    })
  return AppLayout
}

export default CreateAuthSwitch
