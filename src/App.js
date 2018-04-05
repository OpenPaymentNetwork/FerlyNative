import React from 'react';
import { Button, View, Text, TextInput } from 'react-native';
import { StackNavigator } from 'react-navigation';
import CashDisplay from './components/CashDisplay';
import ProfileDisplay from './components/ProfileDisplay';
import HorizontalRuler from './components/HorizontalRuler';
import Theme from './Theme';


const my_url = (
  'https://scontent.fsnc1-1.fna.fbcdn.net/v/t31.0-8/17917329_116311286047' +
  '7719_8773797763845911478_o.jpg?_nc_cat=0&oh=3242425b5f0b4a154713edd53d' +
  'dcba5c&oe=5B6DBC5F');
const brad_url = (
  'https://res.cloudinary.com/tech-beach-retreat/image/upload/v1498676493' +
  '/bradley-wilkes-speaking-at-tech-beach-retreat_bxoill.png');

class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'Wallet',
  };
  render() {
    const apple_url = (
      'https://pbs.twimg.com' +
      '/profile_images/856508346190381057/DaVvCgBo_400x400.jpg');
    const amazon_url = (
      'https://pmcdeadline2.files.wordpress.com' +
      '/2015/08/amazon-featured-image.jpg?w=446&h=299&crop=1');
    const piedpiper_url = (
      'https://encrypted-tbn0.gstatic.com/' +
      'images?q=tbn:ANd9GcRYM_r7EwtIoC5hYDe3OQOEcQccHBRJw9W2szLnVejh_tmoGPR2');
    return (
      <View style={{ flex: 1, paddingHorizontal:20 }}>

        <ProfileDisplay name='Brad Wilkes' url={my_url} />
        <HorizontalRuler marginVertical='0' color={Theme.yellow} />
        <CashDisplay name='Apple' url={apple_url} amount="25.00" />
        <CashDisplay name='Amazon' url={amazon_url} amount="12.45" />
        <CashDisplay name='Pied Piper' url={piedpiper_url} amount="19.80" />
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

class GiveScreen extends React.Component {
  static navigationOptions = {
    title: 'Give Gift',
  };

  constructor(props) {
    super(props);
    this.state = { text: '' };
  }

  renderResults() {
    const text = this.state.text || '';
    if (text.toLowerCase().startsWith('bra')) {
      return (
        <View>
          <ProfileDisplay name='Brad Wilkes' url={brad_url} />
          <ProfileDisplay name='Bradley Wilkes' url={my_url} />
        </View>
      );
    }
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <TextInput
            style={{
              paddingLeft: 30,
              fontSize: 22,
              height: 10,
              flex: .1,
              borderWidth: 9,
              borderColor: '#E4E4E4'}}
            onChangeText={(t) => this.setState({text:t})}
            placeholder="Search" />
        <View style={{paddingHorizontal:20}}>
          {this.renderResults()}
        </View>
      </View>
    );
  }
}

const RootStack = StackNavigator(
  {
    Home: {
      screen: HomeScreen,
    },
    Give: {
      screen: GiveScreen,
    },
  },
  {
    initialRouteName: 'Home',
  }
);

export default class App extends React.Component {
  render() {
    return <RootStack />;
  }
}
