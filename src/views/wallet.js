import React from 'react';
import { Button, View, Text, TextInput } from 'react-native';
import ProfileDisplay from '../components/ProfileDisplay';
import { Constants } from 'expo';
import HorizontalRuler from '../components/HorizontalRuler';
import CashDisplay from '../components/CashDisplay';
import Theme from '../utils/theme';
import {createUrl} from '../utils/fetch';
import { Permissions, Notifications } from 'expo';
import { connect } from 'react-redux';
import {apiRequire} from '../store/api';

export class WalletScreen extends React.Component {
  static navigationOptions = {
    title: 'Wallet',
  };

  componentDidMount() {
    this.props.apiRequire(this.props.walletUrl);
  }

  render() {
    const {amounts} = this.props;
    const my_url = (
    'https://scontent.fsnc1-1.fna.fbcdn.net/v/t31.0-8/17917329_116311286047' +
    '7719_8773797763845911478_o.jpg?_nc_cat=0&oh=3242425b5f0b4a154713edd53d' +
    'dcba5c&oe=5B6DBC5F');
    const apple_url = (
      'https://pbs.twimg.com' +
      '/profile_images/856508346190381057/DaVvCgBo_400x400.jpg');
    const amazon_url = (
      'https://pmcdeadline2.files.wordpress.com' +
      '/2015/08/amazon-featured-image.jpg?w=446&h=299&crop=1');
    return (
      <View style={{ flex: 1, paddingHorizontal:20 }}>

        <ProfileDisplay name='Brad Wilkes' url={my_url} />
        <HorizontalRuler marginVertical='0' color={Theme.yellow} />
        {
          this.props.amounts.map((cashRow) => {
            let url;
            switch (cashRow.title) {
              case 'Amazon':
                url = amazon_url;
                break;
              case 'Apple':
                url = apple_url;
                break;
            }
            return (
              <CashDisplay
                  key={cashRow.id}
                  name={cashRow.title}
                  url={url}
                  amount={cashRow.amount} />
            );
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
    );
  }
}

function map(state) {
  const walletUrl = createUrl('/wallet');

  const apiStore = state.apiStore;
  const amounts = apiStore[walletUrl] || [];


  return {
    walletUrl,
    amounts
  };
}

const dispatch = {
  apiRequire
};

export default connect(map, dispatch)(WalletScreen);
