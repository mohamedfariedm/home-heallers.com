import { useAtomValue } from 'jotai';
import { useTheme } from 'next-themes';
import { Loader } from '@googlemaps/js-api-loader';
import { useEffect, useRef, useState } from 'react';
import { atomWithReset, useResetAtom } from 'jotai/utils';
import { InputProps } from '@/components/ui/input';
import cn from '@/utils/class-names';
import { darkMode } from '@/components/google-map/map-styles';
import Spinner from '@/components/ui/spinner';
import { MarkerClusterer } from "@googlemaps/markerclusterer";

export type Location = {
  address: string;
  lat: number;
  lng: number;
  name: string;
  role: string;
  phone: string;
};

interface GoogleMapsAutocompleteProps {
  apiKey: string;
  hideMap?: boolean;
  hideInput?: boolean;
  className?: string;
  mapClassName?: string;
  inputProps?: InputProps;
  spinnerClassName?: string;
  onPlaceSelect: (place: Location) => void;
  empLocations: Location[]
}

export const locationAtom = atomWithReset<Location>({
  address: '',
  lat: -3.745,
  lng: -38.523,
  name: '',
  role: '',
  phone: ''
});

export default function MapLocations({
  apiKey,
  className,
  hideMap = false,
  hideInput = false,
  mapClassName,
  inputProps,
  onPlaceSelect,
  spinnerClassName,
  empLocations
}: GoogleMapsAutocompleteProps) {
  // check for dark mode
  const { theme } = useTheme();
  // global location state
  const location = useAtomValue(locationAtom);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // to reset location
  const resetLocation = useResetAtom(locationAtom);
  const mapRef = useRef<HTMLDivElement | null>(null);
  onPlaceSelect(empLocations[0])
    const position = {
        lat: -3.759777,
        lng: -38.516305
    }

  useEffect(() => {

    const initMap = async () => {

        const loader = new Loader({
          apiKey,
          version: 'weekly',
        });
        const { Map, InfoWindow } = await loader.importLibrary('maps')
        const { AdvancedMarkerElement, PinElement } = await loader.importLibrary('marker')
        const mapOptions: google.maps.MapOptions = {
            center: { lat: 24.792494, lng: 46.7246549 },
            zoom: 11,
            mapId: 'MY_NEXTJS_MAPID',
            ...(theme === 'dark' && {
                styles: darkMode,
              }),
        }
        const map = new Map(mapRef.current as HTMLDivElement, mapOptions)
        const infoWindow = new InfoWindow({
            content: "",
            disableAutoPan: true,
          });
        const markers = empLocations?.map((position, i) => {
            const pinGlyph = new PinElement({
                glyph: position.name.slice(0,2),
                glyphColor: "white",
                background: position.role == "Promoter" ? 'red' : position.role == 'Marchindaizer' ? 'blue' : 'yellow'
              })
            const marker = new AdvancedMarkerElement({
            position: {lat: Number(position.lat), lng: Number(position.lng)},
            content: pinGlyph.element,
            });
            marker.addListener("click", () => {
                infoWindow.setContent(`<div><div>${position.name}</div>${position.phone}</div>`);
                infoWindow.open(map, marker);
              });
            return marker;
        })
        new MarkerClusterer({ markers, map });
        setIsLoading(false);
    }

    initMap()
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.lat, location?.lng, theme, hideMap, empLocations]);


  return (
    <div className={cn(className)}>
        <div
          id="map"
          ref={mapRef}
          className={cn('h-full w-full', mapClassName)}
        />
    </div>
  );
}
