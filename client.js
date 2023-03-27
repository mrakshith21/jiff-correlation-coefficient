const { compute } = require("./mpc")

x = []
y = []

function parseFile() {
  x = []
  y = []
  var file = document.getElementById("choose-file-button").files[0]
  Papa.parse(file, {
    header: false,
    step: function (results, parser) {
      // console.log("Result", results.data)
      x.push(parseInt(results.data[0]));
      y.push(parseInt(results.data[1]));
    },
    complete: function (results, file) {
      console.log("CSV file parsed successfully");
      document.getElementById('choose-file-description').innerHTML = file.name;
    }
  });
}

function connect() {
  $('#connectButton').prop('disabled', true);
  var computation_id = $('#computation_id').val();
  var party_count = parseInt($('#count').val());

  if (isNaN(party_count)) {
    $('#message').append("<p class='error'>Party count must be a valid number!</p>");
    $('#connectButton').prop('disabled', false);
  } else {
    var options = { party_count: party_count };
    options.onError = function (_, error) {
      $('#message').append("<p class='error'>" + error + '</p>');
    };
    options.onConnect = function () {
      console.log('All parties connected');
      $('#button').attr('disabled', false); $('#status').append('<p>All parties Connected!</p>');
    };

    var hostname = window.location.hostname.trim();
    var port = window.location.port;
    if (port == null || port === '') {
      port = '80';
    }
    if (!(hostname.startsWith('http://') || hostname.startsWith('https://'))) {
      hostname = 'http://' + hostname;
    }
    if (hostname.endsWith('/')) {
      hostname = hostname.substring(0, hostname.length - 1);
    }
    if (hostname.indexOf(':') > -1 && hostname.lastIndexOf(':') > hostname.indexOf(':')) {
      hostname = hostname.substring(0, hostname.lastIndexOf(':'));
    }

    hostname = hostname + ':' + port;
    mpc.connect(hostname, computation_id, options);
  }
}

function computeValues() {
  N = x.length;
  P = 0;
  Sx = 0;
  Sy = 0;
  SSx = 0;
  SSy = 0;
  for (let i = 0; i < N; i++) {
    Sx += x[i];
    Sy += y[i];
    SSx += x[i] * x[i];
    SSy += y[i] * y[i];
    P += x[i] * y[i];
  }
  return [N, P, Sx, Sy, SSx, SSy];

}

function submit() {
  let parameters = ['N', 'P', 'Sx', 'Sy', 'SSx', 'SSy'];
  let values = computeValues();
  let promises = []
  $('#button').attr('disabled', true);
  console.log('Starting computation..');
  $('#message').text('Performing computation...');
  start_time = Date.now();
  values.forEach(value => {
    let promise = mpc.compute(value);
    promises.push(promise);
  });
  Promise.all(promises).then(result => {
    results = {}
    for (let i = 0; i < result.length; i++) {
      results[parameters[i]] = result[i];
    }
    console.log(results);

    x_bar = results.Sx / results.N;
    y_bar = results.Sy / results.N;
    console.log("x_bar = ", x_bar);
    console.log("y_bar = ", y_bar);
    var covariance = (results.P - results.N * x_bar * y_bar);
    var sd_x = Math.sqrt(results.SSx - results.N * x_bar * x_bar);
    var sd_y = Math.sqrt(results.SSy - results.N * y_bar * y_bar);
    r = covariance / (sd_x * sd_y);
    console.log("Result = ", r);
    $('#message').text('The computed correlation coefficient between the age and blood glucose sugar level is');
    $('#output').text(r.toFixed(3));
    document.querySelector('#result').scrollIntoView({
      behavior: 'smooth'
    });
    end_time = Date.now();
    console.log('Time: ', (end_time - start_time) / 1000, ' seconds');
  });
}
