import Inferno from 'inferno';
import Component from 'inferno-component';
import CalendarSelectRow from './CalendarSelectRow';

class CalendarTable extends Component {
    constructor(props) {
        super(props);

        console.log(this.props);
        this.state = {
            error: null
        };
    }

    render(props) {
        const data = this.props.tableData;
        const tableFields = props.tableFields;
        const numFilters = Object.keys(props.dataFilters[props.dataType]).filter(function (fk) { return props.dataFilters[props.dataType][fk].size > 0}).length;


        return (
            <table className="table table-sm table-striped table-bordered">
                <thead>
                    {(data.length > 500 ?
                        <tr>
                            <th colspan="14" class="alert alert-danger">Hakuehtoja vastaa yli 500 kohdetta. Näytetään 500 ensimmäistä hakutulosta, tarkenna hakuehtoja.</th>
                        </tr> : "")}
                    <tr>
                        {tableFields.map((f) => <th>{f}</th>)}
                        <th>dates</th>
                        <th>&nbsp;</th>

                    </tr>
                </thead>
                <tbody>
                    {data.map((d) =>
                        <CalendarSelectRow rowData={d} numFilters={numFilters} {...props} />
                    )}
                </tbody>
            </table>
        );
    }
}

export default CalendarTable;
