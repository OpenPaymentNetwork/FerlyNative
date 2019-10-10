import AddressForm from 'ferly/views/FerlyCard/AddressForm'
import Contact from 'ferly/views/Invitations/Contact'
import Contacts from 'ferly/views/Invitations/Contacts'
import FerlyCard from 'ferly/views/FerlyCard/FerlyCard'
import Give from 'ferly/views/Give/Give'
import Recipient from 'ferly/views/Give/Recipient'
import History from 'ferly/views/History/History'
import Invitations from 'ferly/views/Invitations/Invitations'
import Icon from 'react-native-vector-icons/FontAwesome'
import ManualAdd from 'ferly/views/Invitations/ManualAdd'
import NewCardForm from 'ferly/views/FerlyCard/NewCardForm'
import Profile from 'ferly/views/Profile/Profile'
import React from 'react'
import RecoveryChannel from 'ferly/views/Public/RecoveryChannel'
import RecoveryCode from 'ferly/views/Public/RecoveryCode'
import Settings from 'ferly/views/Settings/Settings'
import SignUp from 'ferly/views/Public/SignUp'
import SignUpCode from 'ferly/views/Public/SignUpCode'
import SignUpWaiting from 'ferly/views/FerlyCard/SignUpWaiting'
import TestElement from 'ferly/components/TestElement'
import Transfer from 'ferly/views/History/Transfer'
import Home from 'ferly/views/Wallet/Home'
import Value from 'ferly/views/Wallet/Value'
import LandingPage from 'ferly/views/Public/LandingPage'
import Locations from 'ferly/views/Wallet/Locations'
import Cart from 'ferly/views/Purchase/Cart'
import Purchase from 'ferly/views/Purchase/Purchase'
import Market from 'ferly/views/Purchase/Market'
import Recovery from 'ferly/views/Settings/Recovery'
import Tutorial from 'ferly/views/Public/Tutorial'
import {
  createDrawerNavigator,
  createStackNavigator,
  createSwitchNavigator
} from 'react-navigation'
import DrawerContent from 'ferly/components/Drawer'
import Theme from 'ferly/utils/theme'

const drawerOptions = ({navigation}) => ({
  headerRight: (
    <TestElement
      parent={Icon}
      label='test-id-drawer-icon'
      name="bars"
      color="white"
      style={{padding: 12}}
      size={26}
      onPress={() => navigation.toggleDrawer()} />
  ),
  headerStyle: {
    backgroundColor: Theme.darkBlue,
    elevation: 1,
    shadowColor: 'gray',
    shadowOffset: { width: 2, height: 1 },
    shadowOpacity: 5,
    shadowRadius: 10},
  headerTintColor: 'white'
})

const ProfileStack = createStackNavigator({
  Profile: {screen: Profile, navigationOptions: drawerOptions}
})

const WalletStack = createStackNavigator(
  {
    Home: {screen: Home, navigationOptions: drawerOptions},
    Value: {screen: Value, navigationOptions: drawerOptions},
    Locations: {screen: Locations, navigationOptions: drawerOptions},
    Give: {screen: Recipient, navigationOptions: drawerOptions},
    Amount: {screen: Give, navigationOptions: drawerOptions},
    Market: {screen: Market, navigationOptions: drawerOptions},
    Purchase: {screen: Purchase, navigationOptions: drawerOptions},
    Cart: {screen: Cart, navigationOptions: drawerOptions}
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

const HistoryStack = createStackNavigator(
  {
    History: {screen: History, navigationOptions: drawerOptions},
    Transfer: {screen: Transfer, navigationOptions: drawerOptions}
  },
  {
    initialRouteName: 'History'
  }
)

const publicHeader = {
  headerStyle: {
    backgroundColor: Theme.darkBlue,
    elevation: 5,
    shadowColor: 'gray',
    shadowOffset: { width: 2, height: 1 },
    shadowOpacity: 5,
    shadowRadius: 10},
  headerTintColor: 'white'
}

const AuthDrawer = createDrawerNavigator(
  {
    Wallet: WalletStack,
    Profile: ProfileStack,
    'Ferly Card': createStackNavigator(
      {Card: {screen: FerlyCard, navigationOptions: drawerOptions}}),
    History: HistoryStack,
    Invitations: InvitationsStack,
    Settings: SettingsStack
  },
  {
    initialRouteName: 'Wallet',
    drawerPosition: 'right',
    contentComponent: DrawerContent,
    contentOptions: {activeTintColor: Theme.lightBlue}
  }
)

const PubStack = createStackNavigator(
  {
    LandingPage: {screen: LandingPage, navigationOptions: {header: null}},
    SignUp: {screen: SignUp, navigationOptions: publicHeader},
    SignUpCode: {screen: SignUpCode, navigationOptions: publicHeader},
    RecoveryCode: {screen: RecoveryCode, navigationOptions: publicHeader},
    RecoveryChannel: {screen: RecoveryChannel, navigationOptions: publicHeader},
    Tutorial: {screen: Tutorial, navigationOptions: {header: null}},
    AddressForm: {screen: AddressForm, navigationOptions: publicHeader},
    SignUpWaiting: {screen: SignUpWaiting, navigationOptions: publicHeader},
    NewCardForm: {screen: NewCardForm, navigationOptions: publicHeader}
  },
  {
    initialRouteName: 'LandingPage'
  }
)

export const CreateAuthSwitch = (isUser) => {
  const AppLayout = createSwitchNavigator(
    {
      Pub: PubStack,
      Auth: AuthDrawer
    },
    {
      initialRouteName: isUser ? 'Auth' : 'Pub'
    })
  return AppLayout
}

export default CreateAuthSwitch
