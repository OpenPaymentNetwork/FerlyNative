import MapView from 'react-native-maps';
import PropTypes from 'prop-types';
import React from 'react';
import Spinner from 'ferly/components/Spinner';
import Theme from 'ferly/utils/theme';
import {apiRequire} from 'ferly/store/api';
import {connect} from 'react-redux';
import {createUrl, post} from 'ferly/utils/fetch';
import {MaterialIcons} from '@expo/vector-icons';
import {
  Alert,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Linking
} from 'react-native';

export class Locations extends React.Component {
  static navigationOptions = {
    title: 'Locations'
  };

  constructor (props) {
    super(props);
    this.state = {selectedLocation: null};
  }

  componentDidMount () {
    this.props.apiRequire(this.props.locationsUrl);
  }

  fitToMarkers = () => {
    const {locations} = this.props;
    if (locations.length > 0) {
      this.mapview.fitToCoordinates(locations, {
        edgePadding: {top: 100, right: 100, bottom: 100, left: 100},
        animated: false
      });
    }
  }

  openInMaps = () => {
    const {selectedLocation} = this.state;
    const {latitude, longitude, title} = selectedLocation;
    const scheme = Platform.OS === 'ios' ? 'maps:0,0?q=' : 'geo:0,0?q=';
    const latLng = `${latitude},${longitude}`;
    const url = Platform.select({
      ios: `${scheme}${title}@${latLng}`,
      android: `${scheme}${latLng}(${title})`
    });
    Linking.openURL(url);
  }

  render () {
    count++;
    if (count < 2) {
      const text = {'text': 'Locations'};
      post('log-info', this.props.deviceToken, text)
        .then((response) => response.json())
        .then((responseJson) => {
        })
        .catch(() => {
          Alert.alert('Error please check internet connection!');
        });
    }
    if (count >= 2) {
      count = 0;
    }
    const {locations, loaded} = this.props;
    const {selectedLocation} = this.state;

    if (!loaded) {
      return <Spinner />;
    }

    if (locations.length === 0) {
      return (
        <Text
          allowFontScaling={false}>There are no plottable locations to show</Text>
      );
    }

    let selectedDetails;
    if (selectedLocation != null) {
      const {title, address} = selectedLocation;
      selectedDetails = (
        <View style={styles.shadow}>
          <View style={{flexDirection: 'row'}}>
            <View style={styles.selectionDetails}>
              <Text
                allowFontScaling={false}
                style={styles.selectionTitle}>
                {title.replace(/ *\([^)]*\) */g, '')}
              </Text>
              <View style={styles.selectionOptions}>
                <Text
                  allowFontScaling={false}
                  style={styles.selectionAddress}>{address}</Text>
                <TouchableOpacity
                  style={{alignItems: 'center'}}
                  onPress={this.openInMaps}>
                  <MaterialIcons
                    name={'directions'}
                    color={Theme.lightBlue}
                    size={26} />
                  <Text
                    allowFontScaling={false}
                    style={{color: Theme.lightBlue}}>Directions</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={{flex: 1, flexDirection: 'column-reverse'}}>
        <MapView
          maxZoomLevel={17}
          ref={ref => (this.mapview = ref)}
          style={{position: 'absolute', top: 0, left: 0, bottom: 0, right: 0}}
          onMapReady={this.fitToMarkers}>
          {
            locations.map((location, index) => {
              return (
                <MapView.Marker
                  key={index}
                  coordinate={location}
                  onPress={
                    () => this.setState({selectedLocation: location})} />
              );
            })
          }
        </MapView>
        {selectedDetails}
      </View>
    );
  }
}

let count = 0;

Locations.propTypes = {
  apiRequire: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  imageUrl: PropTypes.string,
  loaded: PropTypes.bool.isRequired,
  locations: PropTypes.array,
  locationsUrl: PropTypes.string.isRequired,
  deviceToken: PropTypes.string.isRequired
};

const styles = StyleSheet.create({
  shadow: {
    elevation: 1,
    shadowColor: 'gray',
    shadowOffset: { width: 2, height: 1 },
    shadowOpacity: 5,
    shadowRadius: 10
  },
  selectionDetails: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 20
  },
  selectionTitle: {fontWeight: 'bold', fontSize: 22, color: Theme.darkBlue},
  selectionOptions: {flexDirection: 'row', justifyContent: 'space-between'},
  selectionAddress: {maxWidth: '80%', fontSize: 16}
});

function mapStateToProps (state, props) {
  const {deviceToken} = state.settings;
  const {design} = props.navigation.state.params;
  const {id: designId, logo_image_url: imageUrl} = design;
  const locationsUrl = createUrl('locations', {design_id: designId});
  const apiStore = state.api.apiStore;
  const {locations} = apiStore[locationsUrl] || {};
  let locationCoordinates = [];
  if (locations) {
    locations.forEach((location, index) => {
      if (location.latitude && location.longitude) {
        const coordinates = {
          address: location.address,
          latitude: parseFloat(location.latitude),
          longitude: parseFloat(location.longitude),
          title: location.title
        };
        locationCoordinates.push(coordinates);
      }
    });
  }
  return {
    deviceToken,
    imageUrl,
    loaded: locations !== undefined,
    locationsUrl,
    locations: locationCoordinates
  };
}

const mapDispatchToProps = {
  apiRequire
};

export default connect(mapStateToProps, mapDispatchToProps)(Locations);
