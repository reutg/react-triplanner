import React, { Component } from 'react'

import { withStyles } from '@material-ui/core/styles';
import { Input } from '@material-ui/core';

// const axios = require('axios')
const apiKey = require('./config')


const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        flexDirection: 'column'
    },
    input: {
        margin: theme.spacing(1),
        width: '500px',
        align: 'left'
      }
});

class MyMap extends Component {
    constructor() {
        super()
        this.state = {
            lat: "",
            lng: "",
            map: ""
        }
    }
    componentDidMount = () => {
        this.getUserCoor()
    }

    getUserCoor = () => {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude
            const lng = position.coords.longitude
            this.setState({ lat, lng }, () => {
                this.renderMap()
            })
        })
    }

    renderMap = () => {
        loadScript(`https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&libraries=places`)
        window.initMap = this.initMap
    }

    initMap = () => {

        const map = new window.google.maps.Map(document.getElementById('map'), {
            center: { lat: this.state.lat, lng: this.state.lng },
            zoom: 15,
            disableDefaultUI: true,
            zoomControl: true,
            streetViewControl: true,
            fullscreenControl: true
        });

        const marker = new window.google.maps.Marker({
            position: { lat: this.state.lat, lng: this.state.lng },
            map: map,
            draggable: true,
            animation: window.google.maps.Animation.DROP,
            icon: 'https://www.google.com/mapfiles/arrow.png',
        });
        console.log(`current position - lat: ${this.state.lat}, lng:${this.state.lng}`)

        let dragLat
        let dragLng
        window.google.maps.event.addListener(marker, 'dragend', () => {
            dragLat = marker.getPosition().lat()
            dragLng = marker.getPosition().lng()
            console.log(`New position - lat: ${dragLat}, lng: ${dragLng}`)
        });

        window.google.maps.event.addListener(map,'click', (event) => {
            let lat = event.latLng.lat()
            let lng = event.latLng.lng()
            let marker = new window.google.maps.Marker({
                position: { lat, lng },
                map: map,
                draggable: true,
                animation: window.google.maps.Animation.DROP
            })
            window.google.maps.event.addListener(marker, 'dragend', () => {
                dragLat = marker.getPosition().lat()
                dragLng = marker.getPosition().lng()
                console.log(`New position - lat: ${dragLat}, lng: ${dragLng}`)
            });
            console.log("New marker - lat: " + event.latLng.lat() + ", lng: " + event.latLng.lng())
        });

        let input = document.getElementById('places-search');
        let autocomplete = new window.google.maps.places.Autocomplete(input);
        autocomplete.bindTo('bounds', map);

        autocomplete.setFields(
            ['address_components', 'geometry', 'icon', 'name']);
        let infowindow = new window.google.maps.InfoWindow();
        const infowindowContent = document.getElementById('infowindow-content');
        infowindow.setContent(infowindowContent);
        const searchMarker = new window.google.maps.Marker({
            map: map,
            anchorPoint: new window.google.maps.Point(0, -29),
            draggable: true,
            animation: window.google.maps.Animation.DROP
        });

        window.google.maps.event.addListener(searchMarker, 'click', () => {
            let clickLat = searchMarker.getPosition().lat()
            let clickLng = searchMarker.getPosition().lng()
            console.log(`marker - lat: ${clickLat}, lng: ${clickLng}`)

            window.google.maps.event.addListener(searchMarker, 'dragend', () => {
                dragLat = searchMarker.getPosition().lat()
                dragLng = searchMarker.getPosition().lng()
                console.log(`New position - lat: ${dragLat}, lng: ${dragLng}`)
            });
        });

        

        autocomplete.addListener('place_changed', function () {
            infowindow.close();
            searchMarker.setVisible(false);
            const place = autocomplete.getPlace();
            if (!place.geometry) {
                window.alert("No details available for input: '" + place.name + "'");
                return;
            }

            if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
            } else {
                map.setCenter(place.geometry.location);
                map.setZoom(17);  
            }
            searchMarker.setPosition(place.geometry.location);
            searchMarker.setVisible(true);

            let address = '';
            if (place.address_components) {
                address = [
                    (place.address_components[0] & place.address_components[0].short_name || ''),
                    (place.address_components[1] & place.address_components[1].short_name || ''),
                    (place.address_components[2] & place.address_components[2].short_name || '')
                ].join(' ');
            }

        });

        //add the coordinates of each trail
        let polyPath = [
            { lat: 37.772, lng: -122.214 },
            { lat: 21.291, lng: -157.821 },
            { lat: -18.142, lng: 178.431 },
            { lat: -27.467, lng: 153.027 }
        ]

        const poly = new window.google.maps.Polyline({
            path: polyPath,
            strokeColor: '#000000',
            strokeOpacity: 1.0,
            strokeWeight: 3
        });
        poly.setMap(map);

        map.addListener('click', this.addLatLng);
        window.google.maps.eventaddLatLng = (event) => {
            const path = poly.getPath();

            path.push(event.latLng);

            const marker3 = new window.google.maps.Marker({
                position: event.latLng,
                title: '#' + path.getLength(),
                map: map
            });
        }
    }

    render() {
        const { classes } = this.props

        return (
            <div className={classes.container}>
                <Input
                    placeholder="Enter location"
                    id="places-search"
                    className={classes.input}
                    inputProps={{
                        'aria-label': 'Description',
                    }}
                />
                    <div id="map" style={{ margin: '10px' }}></div>
            </div>
        )
    }
}

const loadScript = function (url) {
    const index = window.document.getElementsByTagName("script")[0]
    const script = window.document.createElement("script")
    script.src = url
    script.async = true
    script.defer = true

    index.parentNode.insertBefore(script, index)
}

export default withStyles(styles)(MyMap);
