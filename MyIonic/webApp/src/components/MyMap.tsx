import { withScriptjs, withGoogleMap, GoogleMap, Marker } from 'react-google-maps';
import { compose, withProps } from 'recompose';

const mapsApiKey = 'AIzaSyDGk1nAVcaFDfG7dcE6_oYq5c4IDFYKirI';

interface MyMapProps {
  lat?: number;
  lng?: number;
  onMapClick: (e: any) => void;
  onMarkerClick: (e: any) => void;
}

export const MyMap = compose<MyMapProps, any>(
  withProps({
    googleMapURL: `https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&v=3.exp&libraries=geometry,drawing,places`,
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `150px` }} />,
    mapElement: <div style={{ height: `100%` }} />,
  }),
  withScriptjs,
  withGoogleMap
)((props) => (
  <GoogleMap defaultZoom={8} defaultCenter={{ lat: props.lat, lng: props.lng }} onClick={props.onMapClick}>
    <Marker position={{ lat: props.lat, lng: props.lng }} onClick={props.onMarkerClick} />
  </GoogleMap>
));
