
jQuery(document).ready(function($) {
"use strict";

// AutoHeight.Defaults = {
//     autoHeight: false,
//     autoHeightClass: 'owl-height'
// };


$('.navbar-nav>li>a').on('click', function(){
    $('.navbar-collapse').collapse('hide');
});


 $('.owl-carousel').owlCarousel({
    loop:true,
    margin:10,
    autoplay:true,
    autoHeight:false,
    autoplayTimeout:5000,   
    nav:false,
    responsive:{
        0:{
            items:1
        },
        600:{
            items:1
        },
        1000:{
            items:1
        }
    }
})


$('body').scrollspy({ target: '#navbar-example' })


function createTimer() {
    var endTime = new Date("2022/9/15 00:00:00");
    endTime = (Date.parse(endTime) / 1000);
    var startTime = new Date();
    startTime = (Date.parse(startTime) / 1000);
    var remainingTime = endTime - startTime;
    var days = Math.floor(remainingTime / 86400);
    var hours = Math.floor((remainingTime - (days * 86400)) / 3600);
    var minutes = Math.floor((remainingTime - (days * 86400) - (hours * 3600 )) / 60);
    var seconds = Math.floor((remainingTime - (days * 86400) - (hours * 3600) - (minutes * 60)));
    if (hours < "10") { hours = "0" + hours; }
    if (minutes < "10") { minutes = "0" + minutes; }
    if (seconds < "10") { seconds = "0" + seconds; }
    $("#days").html(days + "<span>Days</span>");
    $("#hours").html(hours + "<span>Hours</span>");
    $("#minutes").html(minutes + "<span>Minutes</span>");
    $("#seconds").html(seconds + "<span>Seconds</span>");
}
    setInterval(function() { createTimer(); }, 1000);
});


/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
// [START maps_add_map]
// Initialize and add the map
function initMap() {
    // [START maps_add_map_instantiate_map]
    // The location of Uluru
    const uluru = { lat: 23.771937904225013, lng: 90.37547718419236 };
    // The map, centered at Uluru
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 4,
      center: uluru,
    });
    // [END maps_add_map_instantiate_map]
    // [START maps_add_map_instantiate_marker]
    // The marker, positioned at Uluru
    const marker = new google.maps.Marker({
      position: uluru,
      map: map,
    });
    // [END maps_add_map_instantiate_marker]
  }
  
  window.initMap = initMap;
  // [END maps_add_map]
