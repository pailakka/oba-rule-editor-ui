import Inferno from 'inferno';
import Component from 'inferno-component';
import FilterSelectTable from './lib/FilterSelectTable.js';
import Config from './config';
import FilterFormModal from './lib/FilterFormModal.js';

class Stops extends Component {
    constructor(props) {
        super(props)
        this.state = {
            stops: [],
            municipalities: [],
            selectedStops: new Set(),
            filter: { id: null, text: null, muni: [] }
        }

        this.fetchTimeout = null;

        this.onStopFilterChange = this.onStopFilterChange.bind(this);
        this.onStopDataReceived = this.onStopDataReceived.bind(this);
        this.fetchStopData = this.fetchStopData.bind(this);
        this.onCreateNewRuleBtn = this.onCreateNewRuleBtn.bind(this);
        this.onCloseFormModal = this.onCloseFormModal.bind(this);
        this.onMatchingChange = this.onMatchingChange.bind(this);
    }


    fetchMatchingStopData() {
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
                a.onStopDataReceived(json.data);
                a.fetchTimeout = null;
            }).catch(function (ex) {
                console.log('parsing failed', ex)
            });
    }

    onMatchingChange(e) {
        const showMatching = !this.state.showMatching;
        this.setState({ showMatching });

        if (showMatching) {
            this.fetchMatchingStopData();
        } else {
            this.fetchStopData();
        }
    }

    fetchStopData() {
        console.log('fetchStopData', new Date(), 'filter', this.state.filter);
        var a = this;
        var query = [];
        if (this.state.filter.id) query.push('i=' + encodeURIComponent(this.state.filter.id));
        if (this.state.filter.text) query.push('t=' + encodeURIComponent(this.state.filter.text));
        if (this.state.filter.muni && this.state.filter.muni.length > 0) query.push('m=' + this.state.filter.muni.join(','));

        console.log('fetchStopData', 'query', query);

        fetch(Config.API_URL + 'stops?' + query.join('&'))
            .then(function (response) {
                return response.json();
            }).then(function (json) {

                if (json.status !== "OK") {
                    return true;
                }
                a.onStopDataReceived(json.stops);
                a.fetchTimeout = null;
            }).catch(function (ex) {
                console.log('parsing failed', ex)
            })
    }
    componentDidMount() {
        const municipalities = this.fetchMunicipalities();
        this.setState({ municipalities });

        this.fetchStopData();



    }

    fetchMunicipalities() {
        return [
            { id: 1, name: "Kotka" },
            { id: 2, name: "Hamina" },
            { id: 3, name: "Helsinki" },
            { id: 4, name: "Taivalkoski" }
        ];
    }
    onStopFilterChange(e) {

        const name = e.target.name;
        var value;
        if (name === "muni") {
            value = [...e.target.options].filter(o => o.selected).map(o => o.value)
        } else {
            value = e.target.value;
        }
        console.log('onStopFilterChange', name, value);
        console.log(Object.assign(this.state.filter, { [name]: value }));
        this.setState({ filter: Object.assign(this.state.filter, { [name]: value }) });

        if (this.fetchTimeout !== null) {
            clearTimeout(this.fetchTimeout);
            this.fetchTimeout = setTimeout(this.fetchStopData, 500);
            return true;
        }
        this.fetchTimeout = setTimeout(this.fetchStopData, 500);

    }

    onStopDataReceived(stops) {
        this.setState({ stops });
    }


    onSelect(stop_id, e) {

        var currsel = this.state.selectedStops;
        if (currsel.has(stop_id)) {
            currsel.delete(stop_id);
        } else {
            currsel.add(stop_id);
        }

        this.setState({ selectedStops: currsel });
        console.log(stop_id, e.target.checked, this.state.selectedStops);

        return true;
    }


    onCreateNewRuleBtn(e) {
        this.setState({ formModalVisible: true });
    }

    onCloseFormModal(e) {
        this.setState({ formModalVisible: false });
    }

    render(props) {
        const municipalities = this.state.municipalities;

        const fields = [
            "stop_id",
            "stop_code",
            "stop_name",
            "stop_desc",
            "stop_lat",
            "stop_lon",
            "zone_id",
            "stop_url",
            "location_type",
            "parent_station",
            "stop_timezone",
            "wheelchair_boarding"
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
                        <h2>Stops</h2>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <input type="text" class="form-control" name="id" placeholder="Hae ID:llä" onInput={this.onStopFilterChange} /><br />
                        <input type="text" class="form-control" name="text" placeholder="Hae vapaatekstillä" onInput={this.onStopFilterChange} />
                    </div>
                    <div className="col">
                        <label for="muni">Sijaintikunta</label>
                        <select class="form-control" id="muni" onChange={this.onStopFilterChange} name="muni" multiple="multiple">
                            {municipalities.map((m, i) =>
                                <option value={m.id}>{m.name}</option>
                            )}
                        </select>
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
                        <FilterSelectTable tableData={this.state.stops} tableFields={fields} dataIdField="stop_id" {...props} />
                    </div>
                </div>
                {modal}
            </div>
        );
    }
}

export default Stops;


