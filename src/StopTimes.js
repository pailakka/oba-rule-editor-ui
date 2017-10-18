import Inferno from 'inferno';
import Component from 'inferno-component';
import FilterSelectTable from './lib/FilterSelectTable.js';
import Config from './config';
import FilterFormModal from './lib/FilterFormModal.js';


class Trips extends Component {
    constructor(props) {
        super(props)
        this.state = {
            stoptimes: [],
            filter: { trip: null, stop: null, arrival: null, departure: null }
        }

        if (props.dataFilters.stops.stop_id !== undefined && props.dataFilters.stops.stop_id.size > 0) {
            Object.assign(this.state,{ filter: Object.assign(this.state.filter, { stop: Array.from(props.dataFilters.stops.stop_id).join(',') }) });
        }

        if (props.dataFilters.trips.trip_id !== undefined && props.dataFilters.trips.trip_id.size > 0) {
            Object.assign(this.state,{ filter: Object.assign(this.state.filter, { trip: Array.from(props.dataFilters.trips.trip_id).join(',') }) });
        }


        this.fetchTimeout = null;

        this.onStopTimeFilterChange = this.onStopTimeFilterChange.bind(this);
        this.onStopTimeDataReceived = this.onStopTimeDataReceived.bind(this);
        this.fetchStopTimeData = this.fetchStopTimeData.bind(this);
        this.onCreateNewRuleBtn = this.onCreateNewRuleBtn.bind(this);
        this.onCloseFormModal = this.onCloseFormModal.bind(this);
        this.onMatchingChange = this.onMatchingChange.bind(this);
    }


    fetchMatchingStopTimeData() {
        const filters = this.props.dataFilters[this.props.dataType];
        const a = this;
        console.log('filters', filters);
        var outfilters = {};
        Object.keys(filters).forEach(function (fk, i) {
            outfilters[fk] = Array.from(filters[fk]);
        });

        console.log(outfilters);
        console.log(JSON.stringify(outfilters));

        fetch(Config.API_URL + "matching/" + this.props.dataType, {
            method: "POST",
            mode: 'cors',
            body: JSON.stringify(outfilters)
        })
            .then(function (response) {
                return response.json();
            }).then(function (json) {

                if (json.status !== "OK") {
                    a.setState({
                        error: json.error
                    });
                    return true;
                }
                a.onStopTimeDataReceived(json.data);
                a.fetchTimeout = null;
            }).catch(function (ex) {
                console.log('parsing failed', ex)
            });
    }

    onMatchingChange(e) {
        const showMatching = !this.state.showMatching;
        this.setState({ showMatching });

        if (showMatching) {
            this.fetchMatchingStopTimeData();
        } else {
            this.fetchStopTimeData();
        }
    }

    fetchStopTimeData() {
        console.log('fetchStopTimeData', new Date(), 'filter', this.state.filter);
        var a = this;
        var query = [];

        if (this.state.filter.trip) this.state.filter.trip.split(',').map((i) => query.push('t=' + encodeURIComponent(i)));
        if (this.state.filter.stop) this.state.filter.stop.split(',').map((a) => query.push('s=' + encodeURIComponent(a)));
        if (this.state.filter.arrival) query.push('a=' + encodeURIComponent(this.state.filter.arrival));
        if (this.state.filter.departure) query.push('d=' + encodeURIComponent(this.state.filter.departure));


        console.log('fetchStopTimeData', 'query', query);

        fetch(Config.API_URL + 'stoptimes?' + query.join('&'))
            .then(function (response) {
                return response.json();
            }).then(function (json) {

                if (json.status !== "OK") {
                    return true;
                }
                a.onStopTimeDataReceived(json.stoptimes);
                a.fetchTimeout = null;
            }).catch(function (ex) {
                console.log('parsing failed', ex)
            })
    }
    componentDidMount() {
        this.fetchStopTimeData();



    }

    onStopTimeFilterChange(e) {

        const name = e.target.name;
        const value = e.target.value;

        console.log('onStopTimeFilterChange', name, value);
        console.log(Object.assign(this.state.filter, { [name]: value }));
        this.setState({ filter: Object.assign(this.state.filter, { [name]: value }) });

        if (this.fetchTimeout !== null) {
            clearTimeout(this.fetchTimeout);
            this.fetchTimeout = setTimeout(this.fetchStopTimeData, 500);
            return true;
        }
        this.fetchTimeout = setTimeout(this.fetchStopTimeData, 500);

    }

    onStopTimeDataReceived(stoptimes) {
        this.setState({ stoptimes });
    }

    onCreateNewRuleBtn(e) {
        this.setState({ formModalVisible: true });
    }

    onCloseFormModal(e) {
        this.setState({ formModalVisible: false });
    }


    render(props) {
        const fields = [
            "trip_id",
            "arrival_time",
            "departure_time",
            "stop_id",
            "stop_sequence",
            "stop_headsign",
            "pickup_type",
            "drop_off_type",
            "shape_dist_traveled",
            "timepoint"
        ];


        var modal;
        if (this.state.formModalVisible) {
            modal = <FilterFormModal fields={fields} onCloseFormModal={this.onCloseFormModal} {...props} />
        } else {
            modal = null;
        }

        return (
            <div className="App">
                <div className="row">
                    <div className="col">
                        <h2>StopTimes</h2>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <input type="text" class="form-control" name="trip" placeholder="Hae trip_id:llä" onInput={this.onStopTimeFilterChange} value={this.state.filter.trip} />
                        <input type="text" class="form-control" name="stop" placeholder="Hae pysäkillä" onInput={this.onStopTimeFilterChange} value={this.state.filter.route} />
                    </div>
                    <div className="col">
                        <input type="text" class="form-control" name="arrival" placeholder="Hae saapumisajalla" onInput={this.onStopTimeFilterChange} />
                        <input type="text" class="form-control" name="departure" placeholder="Hae lähtöajalla" onInput={this.onStopTimeFilterChange} />
                    </div>
                    <div className="col">
                        <button onClick={this.onCreateNewRuleBtn}>Luo uusi sääntö</button>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <form class="form-inline">
                            <label className="form-check-label">Näytä suodattimiin täsmäävät rivit: <input type="checkbox" class="form-check-input" name="matching" onChange={this.onMatchingChange} checked={this.state.showMatching} /></label>
                        </form>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <FilterSelectTable tableData={this.state.stoptimes} tableFields={fields} dataType="stoptime" dataIdField="" {...props} />
                    </div>
                </div>
                {modal}
            </div>
        );
    }
}

export default Trips;


