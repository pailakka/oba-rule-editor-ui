import Inferno from 'inferno';
import Component from 'inferno-component';
import serialize from 'form-serialize';
import Config from '../config';


class FilterFormModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
            info: { matching: 0 },
            action: "update"
        };


        this.onActionChange = this.onActionChange.bind(this);
        this.onRuleSubmit = this.onRuleSubmit.bind(this);
    }
    componentDidMount() {
        const filters = this.props.dataFilters[this.props.dataType];
        const a = this;
        console.log('filters', filters);
        var outfilters = {};
        Object.keys(filters).forEach(function (fk, i) {
            outfilters[fk] = Array.from(filters[fk]);
        });

        console.log(outfilters);
        console.log(JSON.stringify(outfilters));

        fetch(Config.API_URL + "info/" + this.props.dataType, {
            method: "POST",
            mode: 'cors',
            body: JSON.stringify(outfilters)
        })
            .then(function (response) {
                return response.json();
            }).then(function (json) {

                if (json.status !== "OK") {
                    a.setState({ error: json.error });
                    return true;
                }
                console.log(json);
                a.setState({ info: json });
            }).catch(function (ex) {
                console.log('parsing failed', ex)
            });

    }


    onRuleSubmit(e) {

        var outfilters = {}
        const a = this;


        outfilters[a.props.dataType] = {};
        Object.keys(a.props.dataFilters[a.props.dataType]).forEach(function (fk, i) {
            outfilters[a.props.dataType][fk] = Array.from(a.props.dataFilters[a.props.dataType][fk]);
        });
        var editData = {
            'datatype': this.props.dataType,
            'formdata': serialize(e.target, { hash: true }),
            'filters': outfilters
        };

        e.preventDefault();

        fetch(Config.API_URL + "rules/save", {
            method: "POST",
            mode: 'cors',
            body: JSON.stringify(editData)
        })
            .then(function (response) {
                console.log(response);
                return response.json();
            }).then(function (json) {
                console.log(json);
            });
        return false;
    }

    onActionChange(e) {
        var action = e.target.value;
        this.setState({ action });
    }
    render({ fields, dataFilters, onCloseFormModal, dataType }) {

        console.log('info', this.state.info);
        return (<div className="form-modal">
            <h3>Luo uusi sääntö {dataType}</h3>
            <div class="row">
                <div class="col">
                    <h4>Käytettävät suodattimet</h4>
                    <ul>
                        {Object.keys(dataFilters[dataType]).filter((k) => dataFilters[dataType][k].size > 0).map((k) => <li>{k} on {Array.from(dataFilters[dataType][k]).map((v, i) => { return <span>{!!i ? ", " : ""}{v}</span> })} </li>)}

                    </ul>
                </div>
                <div class="col">
                    <span>{this.state.info.matching} osumaa valituilla suodattimilla</span>
                </div>
            </div>
            <form onSubmit={this.onRuleSubmit}>
                <div class="row">
                    <div class="col">
                        Suoritettava toiminto: <select name="action" value={this.state.action} onChange={this.onActionChange}>
                            <option value="update" selected="selected">Muokkaa</option>
                            <option value="add">Lisää</option>
                            <option value="remove">Poista</option>
                        </select>
                    </div>
                </div>
                <hr />
                <div class="row">
                    <div class="col">
                        {this.state.action !== "remove" &&
                            fields.map((f) =>
                                <div class="form-group row">
                                    <label for={"input" + f} class="col-sm-2 col-form-label">{f}</label>
                                    <div class="col-sm-10">
                                        <input type="text" class="form-control" id={"inpout" + f} name={f} placeholder={f} />
                                    </div>
                                </div>
                            )}
                        <hr />
                        <button type="submit" class="btn btn-success">Tallenna sääntö</button>
                        <button type="button" class="btn btn-danger" onClick={onCloseFormModal}>Peruuta</button>

                    </div>
                </div>
            </form>
        </div>);
    }
}


export default FilterFormModal;