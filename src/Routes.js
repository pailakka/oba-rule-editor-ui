import Inferno from 'inferno';
import Component from 'inferno-component';
import FilterSelectTable from './lib/FilterSelectTable.js';
import Config from './config';
import FilterFormModal from './lib/FilterFormModal.js';


class Routes extends Component {
    constructor(props) {
        super(props)
        this.state = {
            routes: [],
            filter: { id: null, agency: null },
            showMatching: false
        }

        if (props.dataFilters.agency.agency_id !== undefined && props.dataFilters.agency.agency_id.size > 0) {
            Object.assign(this.state, { filter: Object.assign(this.state.filter, { agency: Array.from(props.dataFilters.agency.agency_id).join(',') }) });
        }

        this.fetchTimeout = null;

        this.onRouteFilterChange = this.onRouteFilterChange.bind(this);
        this.onRouteDataReceived = this.onRouteDataReceived.bind(this);
        this.fetchRouteData = this.fetchRouteData.bind(this);
        this.onCreateNewRuleBtn = this.onCreateNewRuleBtn.bind(this);
        this.onCloseFormModal = this.onCloseFormModal.bind(this);
        this.onMatchingChange = this.onMatchingChange.bind(this);

    }


    fetchMatchingRouteData() {
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
                a.onRouteDataReceived(json.data);
                a.fetchTimeout = null;
            }).catch(function (ex) {
                console.log('parsing failed', ex)
            });
    }

    onMatchingChange(e) {
        const showMatching = !this.state.showMatching;
        this.setState({ showMatching });

        if (showMatching) {
            this.fetchMatchingRouteData();
        } else {
            this.fetchRouteData();
        }
    }


    fetchRouteData() {
        console.log('fetchRouteData', new Date(), 'filter', this.state.filter);
        var a = this;
        var query = [];

        if (this.state.filter.id) this.state.filter.id.split(',').map((i) => query.push('i=' + encodeURIComponent(i)));
        if (this.state.filter.text) query.push('t=' + encodeURIComponent(this.state.filter.text));
        if (this.state.filter.agency) this.state.filter.agency.split(',').map((a) => query.push('a=' + encodeURIComponent(a)));
        if (this.state.filter.routetype) this.state.filter.routetype.split(',').map((rt) => query.push('ty=' + encodeURIComponent(rt)));

        console.log('fetchRouteData', 'query', query);

        fetch(Config.API_URL + 'routes?' + query.join('&'))
            .then(function (response) {
                return response.json();
            }).then(function (json) {

                if (json.status !== "OK") {
                    return true;
                }
                a.onRouteDataReceived(json.routes);
                a.fetchTimeout = null;
            }).catch(function (ex) {
                console.log('parsing failed', ex)
            })
    }

    componentDidMount() {
        this.fetchRouteData();
    }

    onRouteFilterChange(e) {

        const name = e.target.name;
        const value = e.target.value;

        console.log('e', e);

        console.log('onRouteFilterChange', name, value);
        console.log(Object.assign(this.state.filter, { [name]: value }));
        this.setState({ filter: Object.assign(this.state.filter, { [name]: value }) });

        if (this.fetchTimeout !== null) {
            clearTimeout(this.fetchTimeout);
            this.fetchTimeout = setTimeout(this.fetchRouteData, 500);
            return true;
        }
        this.fetchTimeout = setTimeout(this.fetchRouteData, 500);

    }

    onRouteDataReceived(routes) {
        this.setState({ routes });
    }

    onCreateNewRuleBtn(e) {
        this.setState({ formModalVisible: true });
    }

    onCloseFormModal(e) {
        this.setState({ formModalVisible: false });
    }

    render(props) {

        console.log('showMatching', this.state.showMatching);
        const fields = [
            "route_id",
            "agency_id",
            "route_short_name",
            "route_long_name",
            "route_desc",
            "route_type",
            "route_url",
            "route_color",
            "route_text_color"
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
                        <h2>Routes</h2>
                    </div>
                </div>
                <div className="row">

                    <div className="col">
                        <input type="text" class="form-control" name="id" placeholder="Hae ID:llä" onInput={this.onRouteFilterChange} />
                        <input type="text" class="form-control" name="text" placeholder="Hae vapaatekstillä" onInput={this.onRouteFilterChange} />
                    </div>
                    <div className="col">
                        <input type="text" class="form-control" name="agency" placeholder="Hae agencyllä" onInput={this.onRouteFilterChange} value={this.state.filter.agency} />
                        <input type="text" class="form-control" name="routetype" placeholder="Hae route_type:llä" onInput={this.onRouteFilterChange} />
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
                        <FilterSelectTable tableData={this.state.routes} tableFields={fields} dataType="routes" dataIdField="route_id" {...props} />
                    </div>
                </div>
                {modal}
            </div >
        );
    }
}

export default Routes;


