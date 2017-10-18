import Inferno from 'inferno';
import Component from 'inferno-component';
import FilterSelectTable from './lib/FilterSelectTable.js';
import Config from './config';
import FilterFormModal from './lib/FilterFormModal.js';


class Trips extends Component {
    constructor(props) {
        super(props)
        this.state = {
            trips: [],
            filter: { id: null, route: null, service: null }
        }

        if (props.dataFilters.routes.route_id !== undefined && props.dataFilters.routes.route_id.size > 0) {
            Object.assign(this.state,{ filter: Object.assign(this.state.filter, { route: Array.from(props.dataFilters.routes.route_id).join(',') }) });
        }

        if (props.dataFilters.stoptimes.trip_id !== undefined && props.dataFilters.stoptimes.trip_id.size > 0) {
            Object.assign(this.state,{ filter: Object.assign(this.state.filter, { id: Array.from(props.dataFilters.stoptimes.trip_id).join(',') }) });
        }

        this.fetchTimeout = null;

        this.onTripFilterChange = this.onTripFilterChange.bind(this);
        this.onTripDataReceived = this.onTripDataReceived.bind(this);
        this.fetchTripData = this.fetchTripData.bind(this);
        this.onCreateNewRuleBtn = this.onCreateNewRuleBtn.bind(this);
        this.onCloseFormModal = this.onCloseFormModal.bind(this);
    }

    fetchTripData() {
        console.log('fetchTripData', new Date(), 'filter', this.state.filter);
        var a = this;
        var query = [];

        if (this.state.filter.id) this.state.filter.id.split(',').map((i) => query.push('i=' + encodeURIComponent(i)));
        if (this.state.filter.text) query.push('t=' + encodeURIComponent(this.state.filter.text));
        if (this.state.filter.route) this.state.filter.route.split(',').map((a) => query.push('r=' + encodeURIComponent(a)));
        if (this.state.filter.service) this.state.filter.service.split(',').map((rt) => query.push('s=' + encodeURIComponent(rt)));

        console.log('fetchTripData', 'query', query);

        fetch(Config.API_URL + 'trips?' + query.join('&'))
            .then(function (response) {
                return response.json();
            }).then(function (json) {

                if (json.status !== "OK") {
                    return true;
                }
                a.onTripDataReceived(json.trips);
                a.fetchTimeout = null;
            }).catch(function (ex) {
                console.log('parsing failed', ex)
            })
    }
    componentDidMount() {
        this.fetchTripData();



    }

    onTripFilterChange(e) {

        const name = e.target.name;
        const value = e.target.value;

        console.log('onTripFilterChange', name, value);
        console.log(Object.assign(this.state.filter, { [name]: value }));
        this.setState({ filter: Object.assign(this.state.filter, { [name]: value }) });

        if (this.fetchTimeout !== null) {
            clearTimeout(this.fetchTimeout);
            this.fetchTimeout = setTimeout(this.fetchTripData, 500);
            return true;
        }
        this.fetchTimeout = setTimeout(this.fetchTripData, 500);

    }

    onTripDataReceived(trips) {
        this.setState({ trips });
    }


    onCreateNewRuleBtn(e) {
        this.setState({ formModalVisible: true });
    }

    onCloseFormModal(e) {
        this.setState({ formModalVisible: false });
    }

    render(props) {
        const fields = [
            "route_id",
            "service_id",
            "trip_id",
            "trip_headsign",
            "trip_short_name",
            "direction_id",
            "block_id",
            "shape_id",
            "wheelchair_accessible",
            "bikes_allowed"
        ];


        var modal;
        if (this.state.formModalVisible) {
            modal = <FilterFormModal fields={fields} onCloseFormModal={this.onCloseFormModal} {...props}/>
        } else {
            modal = null;
        }

        return (
            <div className="App">
                <div className="row">
                    <div className="col">
                        <h2>Trips</h2>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <input type="text" class="form-control" name="id" placeholder="Hae ID:llä" onInput={this.onTripFilterChange} value={this.state.filter.id}/>
                        <input type="text" class="form-control" name="text" placeholder="Hae vapaatekstillä" onInput={this.onTripFilterChange} />
                    </div>
                    <div className="col">
                        <input type="text" class="form-control" name="route" placeholder="Hae routeilla" onInput={this.onTripFilterChange} value={this.state.filter.route} />
                        <input type="text" class="form-control" name="service" placeholder="Hae servicellä" onInput={this.onTripFilterChange} />
                    </div>
                    <div className="col">
                        <button onClick={this.onCreateNewRuleBtn}>Luo uusi sääntö</button>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <FilterSelectTable tableData={this.state.trips} tableFields={fields} dataType="trips" dataIdField="trip_id" {...props} />
                    </div>
                </div>
                {modal}
            </div>
        );
    }
}

export default Trips;


