import GiveScreen from './views/give'
import WalletScreen from './views/wallet'
import {StackNavigator} from 'react-navigation'

const Navigation = StackNavigator(
  {
    Wallet: {
      screen: WalletScreen
    },
    Give: {
      screen: GiveScreen
    }
  },
  {
    initialRouteName: 'Wallet'
  }
)

export default Navigation
