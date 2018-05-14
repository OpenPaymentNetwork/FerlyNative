import React from 'react';
import { Button, View, Text, TextInput } from 'react-native';
import ProfileDisplay from '../components/ProfileDisplay';



export default class GiveScreen extends React.Component {
  static navigationOptions = {
    title: 'Give Gifts',
  };

  constructor(props) {
    super(props);
    this.state = { text: '' };
  }

  renderResults() {
   const my_url = (
    'https://scontent.fsnc1-1.fna.fbcdn.net/v/t31.0-8/17917329_116311286047' +
    '7719_8773797763845911478_o.jpg?_nc_cat=0&oh=3242425b5f0b4a154713edd53d' +
    'dcba5c&oe=5B6DBC5F');
  const brad_url = (
    'https://res.cloudinary.com/tech-beach-retreat/image/upload/v1498676493' +
    '/bradley-wilkes-speaking-at-tech-beach-retreat_bxoill.png');
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
