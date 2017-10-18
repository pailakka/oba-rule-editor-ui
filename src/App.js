import Inferno from 'inferno';
import Component from 'inferno-component';
import './App.css';
import { Link, IndexLink } from 'inferno-router';

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      dataFilters: {
        'agency': {},
        'stops': {},
        'routes': {},
        'trips': {},
        'stoptimes': {},
        'calendar': {}
      }
    }
  }

  onTableClick(e) {
    const dataType = this.props.children.props.dataType;

    var filterField = e.target.getAttribute('data-field');

    if (filterField === null) return;
    
    var filterText = e.target.innerText;

    filterText = filterText.trim().toLowerCase();

    var filters = this.state.dataFilters;
    if (filters[dataType][filterField] === undefined) {
      filters[dataType][filterField] = new Set();
    }

    if (filters[dataType][filterField].has(filterText)) {
      filters[dataType][filterField].delete(filterText);
      if (filters[dataType][filterField].size === 0) {
        delete filters[dataType][filterField];
      }
    } else {
      filters[dataType][filterField].add(filterText);
    }
    this.setState({ dataFilters: filters });

  }

  render() {
    this.props.children.props.onTableClick = this.onTableClick.bind(this);
    this.props.children.props.dataFilters = this.state.dataFilters;

    var outfilters = {}
    const a = this;

    Object.keys(a.state.dataFilters).forEach(function (tk, i) {
      outfilters[tk] = {};
      Object.keys(a.state.dataFilters[tk]).forEach(function (fk, i) {
        outfilters[tk][fk] = Array.from(a.state.dataFilters[tk][fk]);
      });
    });

    /*
              <div class="row">
            <div class="col">
              <h2>Suodattimet</h2>
              <pre>{JSON.stringify(outfilters)}</pre>
            </div>
          </div>
          */

    return (
      <div className="App">


        <nav className="navbar fixed-top navbar-expand-lg navbar-dark bg-dark">
          <button className="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse" data-target="#navbarsExampleDefault" aria-controls="navbarsExampleDefault" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <a className="navbar-brand" href="#">Liikenneviraston Koontikannan GTFS transformer sääntötiedosto</a>

          <div className="collapse navbar-collapse" id="navbarsExampleDefault">
            <ul className="navbar-nav mr-auto">
              <li className="nav-item">
                <IndexLink className="nav-link">Etusivu <span class="sr-only">(current)</span></IndexLink>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="agency">Agency <span class="sr-only">(current)</span></Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="stops">Stops <span class="sr-only">(current)</span></Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="routes">Routes <span class="sr-only">(current)</span></Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="trips">Trips <span class="sr-only">(current)</span></Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="stoptimes">Stoptimes <span class="sr-only">(current)</span></Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="calendar">Calendar <span class="sr-only">(current)</span></Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="vallu">Vallu <span class="sr-only">(current)</span></Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="rules">Rules <span class="sr-only">(current)</span></Link>
              </li>
            </ul>
          </div>
        </nav>

        <div className="container-fluid" id="mainContainer">
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default App;
