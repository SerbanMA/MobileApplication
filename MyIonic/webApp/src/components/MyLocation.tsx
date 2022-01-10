import { useEffect, useState } from 'react';
import { Geolocation, Position } from '@capacitor/geolocation';

interface MyLocation {
  position?: Position;
  error?: Error;
}

// export const MyLocation = () => {
//   const [state, setState] = useState<MyLocation>({});
//   useEffect(watchMyLocation, []);
//   return state;

//   function watchMyLocation() {
//     Geolocation.getCurrentPosition()
//       .then((position) => updateMyPosition('current', position))
//       .catch((error) => updateMyPosition('current', undefined, error));

//     const callbackId = Geolocation.watchPosition({}, (position, error) => {
//       updateMyPosition('watch', position || undefined, error);
//     });

//     function updateMyPosition(source: string, position?: Position, error: any = undefined) {
//       console.log(source, position, error);

//       setState({ ...state, position: position || state.position, error });
//     }
//   }
// };
