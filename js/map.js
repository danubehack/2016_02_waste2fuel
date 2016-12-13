function applyMargins() {
    var leftToggler = $(".mini-submenu-left");
    if (leftToggler.is(":visible")) {
        $("#map .ol-zoom")
            .css("margin-left", 0)
            .removeClass("zoom-top-opened-sidebar")
            .addClass("zoom-top-collapsed");
    } else {
        $("#map .ol-zoom")
        .css("margin-left", $(".sidebar-left").width())
        .removeClass("zoom-top-opened-sidebar")
        .removeClass("zoom-top-collapsed");
    }
}

function isConstrained() {
    return $(".sidebar").width() == $(window).width();
}

function applyInitialUIState() {
    if (isConstrained()) {
        $(".sidebar-left .sidebar-body").fadeOut('slide');
        $('.mini-submenu-left').fadeIn();
    }
}

$(function(){
    $('.sidebar-left .slide-submenu').on('click',function() {
        var thisEl = $(this);
        thisEl.closest('.sidebar-body').fadeOut('slide',function(){
            $('.mini-submenu-left').fadeIn();
            applyMargins();
        });
    });
    
    $('.mini-submenu-left').on('click',function() {
        var thisEl = $(this);
        $('.sidebar-left .sidebar-body').toggle('slide');
        thisEl.hide();
        applyMargins();
    });
    
    $(window).on("resize", applyMargins);
    var sitesSource = new ol.source.TileWMS({
        url: 'https://www.pg.geof.unizg.hr/geoserver/w2f_sites/wms',
        params: {
            'FORMAT': 'image/png', 
            'VERSION': '1.1.0',
            tiled: true,
            LAYERS: 'w2f_sites:site',
        }
    });
    var clcSource = new ol.source.TileWMS({
        url: 'https://www.pg.geof.unizg.hr/geoserver/w2f_sites/wms',
        params: {
            'FORMAT': 'image/png', 
            'VERSION': '1.1.0',
            tiled: true,
            LAYERS: 'w2f_sites:clc_sk_2012_311312313',
        }
    });
    
    var olmSource = new ol.source.TileWMS({
        url: 'http://data.datacove.eu:8080/geoserver/lu/wms',
        params: {
            'FORMAT': 'image/png', 
            'VERSION': '1.1.0',
            tiled: true,
            LAYERS: 'lu:ExistingLandUseObject',
        }
    });
    
    var sites = new ol.layer.Tile({
        title: "Sites",
        visible: true,
        source: sitesSource
    });
    
    var clc = new ol.layer.Tile({
        title: "Corine Land Cover",
        visible: false,
        source: clcSource
    });
    
    var olm = new ol.layer.Tile({
        title: "Open Land Use Map",
        visible: false,
        source: olmSource
    });
    
    var osm = new ol.layer.Tile({
        source: new ol.source.OSM()
    });
    
    var view = new ol.View({
        center: [1904478, 6132900],
        zoom: 12
    });
      
    var map = new ol.Map({
        target: "map",
        layers: [
            osm,
            clc,
            olm,
            sites
        ],
        view: view
    });
    
    applyInitialUIState();
    applyMargins();
    
    map.on('singleclick', function(evt) {
        //document.getElementById('info').innerHTML = '';
        var viewResolution = /** @type {number} */ (view.getResolution());
        var url = sitesSource.getGetFeatureInfoUrl(
            evt.coordinate, viewResolution, 'EPSG:3857',
            {'INFO_FORMAT': 'text/javascript'});
        if (url) {
            var parser = new ol.format.GeoJSON();
            $.ajax({
              url: url,
              dataType: 'jsonp',
              jsonpCallback: 'parseResponse'
            }).then(function(response) {
              var result = parser.readFeatures(response);
              if (result.length) {
                /*var info = [];
                for (var i = 0, ii = result.length; i < ii; ++i) {
                  info.push(result[i].get('formal_en'));
                }*/
                //container.innerHTML = info.join(', ');
                var siteAtt = '<p><b>Description:</b> ' + result[0]['H'].description + '</p>' +
                    '<p><b>Contact:</b> ' + result[0]['H'].contact + '</p>' +
                    '<p><b>Volume:</b> ' + result[0]['H'].volume + '</p>' +
                    '<a href="' + result[0]['H'].path + '"><img src="' + result[0]['H'].path + '" alt="' + result[0]['H'].description + '" style="height:100px" /></a>'
                $('#feat-info-body').html(siteAtt);
                $('#feat-info').modal('toggle');
                console.log(result);
              } else {
                //container.innerHTML = '&nbsp;';
                console.log('No data');
              }
            });
          console.log(url);
        }
    });
    
    
    var geolocation = new ol.Geolocation({
        projection: map.getView().getProjection(),
        tracking: false,
        trackingOptions: {
            enableHighAccuracy: true
        }
    });
    geolocation.on('change', function() {
        var position = this.getPosition();
        var speed = this.getSpeed();
        var altitude = this.getAltitude();
        var heading = this.getHeading();

        map.getView().setCenter(position);
        //console.log(position);
        $('#y').val(position[0]);
        $('#x').val(position[1]);
        /*locationCircle.setGeometry(
          new ol.geom.Circle(position, 20)
        );*/
    });
    
    $('body').on('click', '#location', function() {
        geolocation.setTracking(true);
        $('#add-site').modal('show');
    });
    
    $('body').on('click', '#l-osm', function() {
        osm.setVisible(true);
        olm.setVisible(false);
        clc.setVisible(false);
        $('#l-osm').addClass("active");
        $('#l-olm').removeClass("active");
        $('#l-clc').removeClass("active");
    });
    
    $('body').on('click', '#l-clc', function() {
        osm.setVisible(false);
        olm.setVisible(false);
        clc.setVisible(true);
        $('#l-osm').removeClass("active");
        $('#l-olm').removeClass("active");
        $('#l-clc').addClass("active");
    });
    
    $('body').on('click', '#l-olm', function() {
        osm.setVisible(false);
        olm.setVisible(true);
        clc.setVisible(false);
        $('#l-osm').removeClass("active");
        $('#l-olm').addClass("active");
        $('#l-clc').removeClass("active");
    });
    
    $('body').on('click', '#l-sites', function() {
        if (sites.getVisible() == true) {
            sites.setVisible(false);
            $('#l-sites').removeClass("active");
        } else {
            sites.setVisible(true);
            $('#l-sites').addClass("active");
        }
    });
});