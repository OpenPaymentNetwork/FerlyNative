import AddressForm from 'ferly/views/FerlyCard/AddressForm';
import EnterCode from 'ferly/views/Give/EnterCode';
import FerlyCard from 'ferly/views/FerlyCard/FerlyCard';
import Give from 'ferly/views/Give/Give';
import GiveContact from 'ferly/views/Give/GiveContact';
import Recipient from 'ferly/views/Give/Recipient';
import History from 'ferly/views/History/History';
import NewCardForm from 'ferly/views/FerlyCard/NewCardForm';
import Profile from 'ferly/views/Profile/Profile';
import RecoveryChannel from 'ferly/views/Public/RecoveryChannel';
import RecoveryCode from 'ferly/views/Public/RecoveryCode';
import Settings from 'ferly/views/Settings/Settings';
import SignUp from 'ferly/views/Public/SignUp';
import SignUpCode from 'ferly/views/Public/SignUpCode';
import SignUpWaiting from 'ferly/views/FerlyCard/SignUpWaiting';
import Transfer from 'ferly/views/History/Transfer';
import Home from 'ferly/views/Wallet/Home';
import Menu from 'ferly/views/Settings/Menu';
import LoadingInstructions from 'ferly/views/Settings/LoadingInstructions';
import Value from 'ferly/views/Wallet/Value';
import FerlyValue from 'ferly/views/Wallet/FerlyValue';
import LandingPage from 'ferly/views/Public/LandingPage';
import Cart from 'ferly/views/Purchase/Cart';
import MarketCart from 'ferly/views/Purchase/MarketCart';
import Purchase from 'ferly/views/Purchase/Purchase';
import Market from 'ferly/views/Purchase/Market';
import Recovery from 'ferly/views/Settings/Recovery';
import EventListener from 'ferly/components/EventListener';
import Tutorial from 'ferly/views/Public/Tutorial';
import {
  createDrawerNavigator,
  createStackNavigator,
  createSwitchNavigator
} from 'react-navigation';
import Theme from 'ferly/utils/theme';

const drawerOptions = ({navigation}) => ({
  headerStyle: {
    backgroundColor: Theme.darkBlue
  },
  headerTintColor: 'white'
});

const WalletStack = createStackNavigator(
  {
    Home: {screen: Home, navigationOptions: drawerOptions},
    Value: {screen: Value, navigationOptions: drawerOptions},
    FerlyValue: {screen: FerlyValue, navigationOptions: drawerOptions},
    Transfer: {screen: Transfer, navigationOptions: drawerOptions},
    Recipient: {screen: Recipient, navigationOptions: drawerOptions},
    GiveContact: {screen: GiveContact, navigationOptions: drawerOptions},
    Amount: {screen: Give, navigationOptions: drawerOptions},
    Purchase: {screen: Purchase, navigationOptions: drawerOptions},
    Cart: {screen: Cart, navigationOptions: drawerOptions},
    FerlyCard: {screen: FerlyCard, navigationOptions: drawerOptions},
    EventListener: {screen: EventListener, navigationOptions: drawerOptions},
    LoadingInstructions: {screen: LoadingInstructions, navigationOptions: drawerOptions}
  },
  {
    initialRouteName: 'Home'
  }
);

const MenuStack = createStackNavigator(
  {
    Menu: {screen: Menu, navigationOptions: drawerOptions},
    Recovery: {screen: Recovery, navigationOptions: drawerOptions},
    FerlyCard: {screen: FerlyCard, navigationOptions: drawerOptions},
    Profile: {screen: Profile, navigationOptions: drawerOptions},
    Settings: {screen: Settings, navigationOptions: drawerOptions},
    Recipient: {screen: Recipient, navigationOptions: drawerOptions},
    Amount: {screen: Give, navigationOptions: drawerOptions},
    GiveContact: {screen: GiveContact, navigationOptions: drawerOptions},
    EnterCode: {screen: EnterCode, navigationOptions: drawerOptions},
    LoadingInstructions: {screen: LoadingInstructions, navigationOptions: drawerOptions}
  },
  {
    initialRouteName: 'Menu'
  }
);

const MarketStack = createStackNavigator(
  {
    Market: {screen: Market, navigationOptions: drawerOptions},
    Purchase: {screen: Purchase, navigationOptions: drawerOptions},
    Cart: {screen: MarketCart, navigationOptions: drawerOptions}
  },
  {
    initialRouteName: 'Market'
  }
);

const HistoryStack = createStackNavigator(
  {
    History: {screen: History, navigationOptions: drawerOptions},
    Transfer: {screen: Transfer, navigationOptions: drawerOptions}
  },
  {
    initialRouteName: 'History'
  }
);

const publicHeader = {
  headerStyle: {
    backgroundColor: Theme.darkBlue,
    elevation: 5,
    shadowColor: 'gray',
    shadowOffset: { width: 2, height: 1 },
    shadowOpacity: 5,
    shadowRadius: 10},
  headerTintColor: 'white'
};

const AuthDrawer = createDrawerNavigator(
  {
    Wallet: WalletStack,
    Market: MarketStack,
    History: HistoryStack,
    Menu: MenuStack
  },
  {
    initialRouteName: 'Wallet',
    contentOptions: {activeTintColor: Theme.lightBlue},
    drawerLockMode: 'locked-closed'
  }
);

const MidStack = createStackNavigator(
  {
    Tutorial: {screen: Tutorial, navigationOptions: {header: null}},
    AddressForm: {screen: AddressForm, navigationOptions: publicHeader},
    SignUpWaiting: {screen: SignUpWaiting, navigationOptions: publicHeader},
    NewCardForm: {screen: NewCardForm, navigationOptions: publicHeader}
  },
  {
    initialRouteName: 'Tutorial'
  }
);

const PubStack = createStackNavigator(
  {
    LandingPage: {screen: LandingPage, navigationOptions: {header: null}},
    SignUp: {screen: SignUp, navigationOptions: publicHeader},
    SignUpCode: {screen: SignUpCode, navigationOptions: publicHeader},
    RecoveryCode: {screen: RecoveryCode, navigationOptions: publicHeader},
    RecoveryChannel: {screen: RecoveryChannel, navigationOptions: publicHeader}
  },
  {
    initialRouteName: 'LandingPage'
  }
);

export const CreateAuthSwitch = (isUser, doneTutorial) => {
  const AppLayout = createSwitchNavigator(
    {
      Pub: PubStack,
      Auth: AuthDrawer,
      Mid: MidStack
    },
    {
      initialRouteName: (isUser === 'false') ? 'Pub' : ((doneTutorial === 'false') ? 'Auth' : 'Auth')
    });
  return (
    AppLayout
  );
};

export default CreateAuthSwitch;
