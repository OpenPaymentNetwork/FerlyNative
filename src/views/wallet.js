// import { Constants } from 'expo'
// import { Permissions, Notifications } from 'expo'
import CashDisplay from '../components/CashDisplay'
import HorizontalRuler from '../components/HorizontalRuler'
import ProfileDisplay from '../components/ProfileDisplay'
import PropTypes from 'prop-types'
import React from 'react'
import Theme from '../utils/theme'
import {apiRequire} from '../store/api'
import {Button, View} from 'react-native'
import {connect} from 'react-redux'
import {createUrl} from '../utils/fetch'

export class WalletScreen extends React.Component {
  static navigationOptions = {
    title: 'Wallet'
  };

  componentDidMount () {
    this.props.apiRequire(this.props.walletUrl)
  }

  render () {
    const myUrl = (
      'https://scontent.fsnc1-1.fna.fbcdn.net/v/t31.0-8/17917329_116311286047' +
      '7719_8773797763845911478_o.jpg?_nc_cat=0&oh=3242425b5f0b4a154713edd53d' +
      'dcba5c&oe=5B6DBC5F')
    const appleUrl = (
      'https://pbs.twimg.com' +
      '/profile_images/856508346190381057/DaVvCgBo_400x400.jpg')
    const amazonUrl = (
      'https://pmcdeadline2.files.wordpress.com' +
      '/2015/08/amazon-featured-image.jpg?w=446&h=299&crop=1')
    return (
      <View style={{flex: 1, paddingHorizontal: 20}}>

        <ProfileDisplay name='Brad Wilkes' url={myUrl} />
        <HorizontalRuler marginVertical='0' color={Theme.yellow} />
        {
          this.props.amounts.map((cashRow) => {
            let url
            switch (cashRow.title) {
              case 'Amazon':
                url = amazonUrl
                break
              case 'Apple':
                url = appleUrl
                break
            }
            return (
              <CashDisplay
                key={cashRow.id}
                name={cashRow.title}
                url={url}
                amount={cashRow.amount} />
            )
          })
        }
        <HorizontalRuler color={Theme.lightBlue} />
        <Button
          title="Give Gift"
          color={Theme.darkBlue}
          onPress={
            () => this.props.navigation.navigate('Give', {name: 'BRAD!'})}
        />
      </View>
    )
  }
}

WalletScreen.propTypes = {
  apiRequire: PropTypes.func.isRequired,
  amounts: PropTypes.array.isRequired,
  walletUrl: PropTypes.string.isRequired,
  navigation: PropTypes.object.isRequired
}

function map (state) {
  const walletUrl = createUrl('/wallet')

  const apiStore = state.apiStore
  const amounts = apiStore[walletUrl] || []

  return {
    walletUrl,
    amounts
  }
}

const dispatch = {
  apiRequire
}

export default connect(map, dispatch)(WalletScreen)
