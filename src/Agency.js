import Inferno from 'inferno';
import Component from 'inferno-component';
import Config from './config';
import FilterSelectTable from './lib/FilterSelectTable.js';
import './Modal.css';
import FilterFormModal from './lib/FilterFormModal.js';


class Agency extends Component {
    constructor(props) {
        super(props);
        this.state = {
            filter: null,
            formModalVisible: false,
            agency: []
        }

        this.agencyTextFilterChange = this.agencyTextFilterChange.bind(this);
        this.onCreateNewRuleBtn = this.onCreateNewRuleBtn.bind(this);
        this.onCloseFormModal = this.onCloseFormModal.bind(this);
    }


    componentDidMount() {
        var a = this;
        fetch(Config.API_URL + 'agency')
            .then(function (response) {
                return response.json();
            }).then(function (json) {

                if (json.status !== "OK") {
                    a.setState({ error: json.error });
                    return true;
                }
                a.setState({ agency: json.agency });
            }).catch(function (ex) {
                console.log('parsing failed', ex)
            })

    }

    agencyTextFilterChange(e) {
        this.setState({ filter: e.target.value });
    }

    onCreateNewRuleBtn(e) {
        this.setState({ formModalVisible: true });
    }

    onCloseFormModal(e) {
        this.setState({ formModalVisible: false });
    }

    render(props) {
        const agencies = this.state.agency;
        const fields = [
            'agency_id',
            'agency_name',
            'agency_url',
            'agency_timezone',
            'agency_lang',
            'agency_phone',
            'agency_fare_url',
            'agency_email'];

        const freetextFilterFields = ["agency_id", "agency_name", "agency_url"];

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
                        <h2>Agency</h2>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <input type="text" class="form-control" id="inlineFormInputGroup" placeholder="Hae vapaatekstillä" onInput={this.agencyTextFilterChange} />
                    </div>
                    <div className="col">
                        <button onClick={this.onCreateNewRuleBtn}>Luo uusi sääntö</button>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <FilterSelectTable tableData={agencies} tableFields={fields} freeTextFilterFields={freetextFilterFields} freeTextFilter={this.state.filter} dataIdField="agency_id" {...props} />
                    </div>
                </div>
                {modal}
            </div>
        );
    }
}

export default Agency;
