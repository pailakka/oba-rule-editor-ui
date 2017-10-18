import Inferno from 'inferno';
import Component from 'inferno-component';
import Config from './config';
import FilterSelectTable from './lib/FilterSelectTable.js';
import './Modal.css';
import FilterFormModal from './lib/FilterFormModal.js';
import moment from 'moment';

class Agency extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rules: []
        }
    }

    getRuleData() {
        var a = this;
        fetch(Config.API_URL + 'rules/list',{
            mode: 'cors'
        })
            .then(function (response) {
                return response.json();
            }).then(function (json) {

                if (json.status !== "OK") {
                    a.setState({ error: json.error });
                    return true;
                }
                a.setState({ rules: json.rules });
            }).catch(function (ex) {
                console.log('parsing failed', ex)
            })
    }

    componentDidMount() {
        this.getRuleData()
    }

    postRuleUpdate(action,callback) {
        fetch(Config.API_URL + "rules/update", {
            method: "POST",
            mode: 'cors',
            body: JSON.stringify(action)
        })
            .then(function (response) {
                return response.json();
            }).then(function (json) {
                console.log('postRuleUpdate',json);
                callback();
            });
    }

    ruleActiveStatusChanged(id, e) {
        console.log('ruleActiveStatusChanged', id, e)

        this.postRuleUpdate({'rule_id':id,'type':'active','value':e.target.checked},this.getRuleData.bind(this))
    }

    deleteRuleButtonClicked(id) {
        console.log('deleteRuleButtonClicked', id)
        this.postRuleUpdate({'rule_id':id,'type':'delete'},this.getRuleData.bind(this))
    }

    render(props) {
        const rules = this.state.rules;

        return (
            <div className="App">
                <div className="row">
                    <div className="col">
                        <h2>Säännöt</h2>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <table class="table table-sm table-bordered table-stripes">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Tiedosto</th>
                                    <th>Toimenpide</th>
                                    <th>Suodattimet</th>
                                    <th>Muutokset</th>
                                    <th>Lisätty</th>
                                    <th>Aktiivinen</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rules.map((m) => <tr>
                                    <td>{m.rule_id}</td>
                                    <td>{m.target_file}</td>
                                    <td>{m.action}</td>
                                    <td><pre>{JSON.stringify(m.filter, null, 4)}</pre></td>
                                    <td><pre>{JSON.stringify(m.modifications)}</pre></td>
                                    <td>{moment.unix(m.created).format()}</td>
                                    <td><input type="checkbox" onChange={(e) => this.ruleActiveStatusChanged(m.rule_id,e)}  checked={m.active}/></td>
                                    <td><button onClick={() => this.deleteRuleButtonClicked(m.rule_id)}>Poista sääntö</button></td>
                                </tr>)}
                            </tbody>
                        </table>

                    </div>
                </div>
            </div>
        );
    }
}

export default Agency;

