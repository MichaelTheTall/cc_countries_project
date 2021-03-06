const PubSub = require('../helpers/pub_sub.js');
const createAppend = require('../helpers/create_append.js');
const SelectView = require('./select_view.js');
const Highcharts = require('highcharts/highmaps');
require('highcharts/modules/exporting')(Highcharts);
const maps = require('../helpers/maps.js');
Highcharts.maps = maps;

const MapSelectView = function(element) {
  this.element = element;
};

MapSelectView.prototype.bindEvents = function () {
  PubSub.subscribe('Countries:country-names', (event) => {
    this.renderMap(event.detail);
  });
};

MapSelectView.prototype.excludeCountries = function (data) {
  const mapCodes = maps['custom/world-robinson-highres'].features.map(m => {
    return m.properties['iso-a3'];
  })
  return data.filter(country => mapCodes.includes(country.code))
}

MapSelectView.prototype.renderMap = function (data) {
  this.element.innerHTML = '';
  const element = createAppend('div', '', this.element);
  element.id = ('select-map');
  Highcharts.mapChart(element, {
    chart: {
      map: 'custom/world-robinson-highres',
      height: '50%',
      backgroundColor: '#7FCAFF'
    },
    title: {
      text: ''
    },
    mapNavigation: {
      enabled: true,
      buttonOptions: {
        verticalAlign: 'bottom'
      }
    },
    series: [{
      allowPointSelect: true,
      animation: true,
      borderColor: 'black',
      data: this.excludeCountries(data),
      joinBy: ['iso-a3', 'code'],
      name: 'Index',
      showInLegend: false,
    }],
    plotOptions:{
      series:{
        colorByPoint: true,
        colors: ['#4572A7', '#AA4643', '#89A54E', '#80699B', '#3D96AE',
           '#DB843D', '#92A8CD', '#A47D7C', '#B5CA92'],
        cursor: 'pointer',
        point:{
          events:{
            click: function () {
              PubSub.publish('SelectView:country-index', this.value)
            }
          }
        }
      }
    },
    tooltip: {
      formatter: function () {return this.point.name;}
    }
  });
}

module.exports = MapSelectView;
