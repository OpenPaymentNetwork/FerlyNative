import MapView from 'react-native-maps';
import PropTypes from 'prop-types';
import React from 'react';
import Spinner from 'ferly/components/Spinner';
import StoreAvatar from 'ferly/components/StoreAvatar';
import Theme from 'ferly/utils/theme';
import {apiRequire} from 'ferly/store/api';
import {connect} from 'react-redux';
import {createUrl} from 'ferly/utils/fetch';
import {MaterialIcons} from '@expo/vector-icons';
import {
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
    const {locations, loaded} = this.props;
    const {selectedLocation} = this.state;

    if (!loaded) {
      return <Spinner />;
    }

    if (locations.length === 0) {
      return (
        <Text>There are no plottable locations to show</Text>
      );
    }

    let selectedDetails;
    if (selectedLocation != null) {
      const {params} = this.props.navigation.state;
      const {design} = params;
      const {field_color: fieldColor} = design;
      const {title, address} = selectedLocation;
      selectedDetails = (
        <View style={styles.shadow}>
          <View style={[styles.logo, {backgroundColor: `#${fieldColor}`}]} >
            <StoreAvatar size={55} title={title} />
          </View>
          <View style={{flexDirection: 'row'}}>
            <View style={styles.selectionDetails}>
              <Text style={styles.selectionTitle}>
                {title.replace(/ *\([^)]*\) */g, '')}
              </Text>
              <View style={styles.selectionOptions}>
                <Text style={styles.selectionAddress}>{address}</Text>
                <TouchableOpacity
                  style={{alignItems: 'center'}}
                  onPress={this.openInMaps}>
                  <MaterialIcons
                    name={'directions'}
                    color={Theme.lightBlue}
                    size={26} />
                  <Text style={{color: Theme.lightBlue}}>Directions</Text>
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

Locations.propTypes = {
  apiRequire: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  imageUrl: PropTypes.string,
  loaded: PropTypes.bool.isRequired,
  locations: PropTypes.array,
  locationsUrl: PropTypes.string.isRequired
};

const styles = StyleSheet.create({
  shadow: {
    elevation: 1,
    shadowColor: 'gray',
    shadowOffset: { width: 2, height: 1 },
    shadowOpacity: 5,
    shadowRadius: 10
  },
  logo: {
    marginLeft: 20,
    zIndex: 1,
    marginBottom: -35,
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 8,
    borderColor: 'white'
  },
  selectionDetails: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 35
  },
  selectionTitle: {fontWeight: 'bold', fontSize: 22, color: Theme.darkBlue},
  selectionOptions: {flexDirection: 'row', justifyContent: 'space-between'},
  selectionAddress: {maxWidth: '80%', fontSize: 16}
});

function mapStateToProps (state, props) {
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
