import Inferno from 'inferno';
import Component from 'inferno-component';
import 'whatwg-fetch';
import FilterSelectRow from './FilterSelectRow';

class FilterSelectTable extends Component {
    constructor(props) {
        super(props);

        console.log(this.props);
        this.state = {
            error: null
        };
    }

    render(props) {
        var data = this.props.tableData;
        
        if (this.props.freeTextFilter && this.props.freeTextFilterFields && this.props.freeTextFilter.length > 0) {
            const ak = this.props.freeTextFilterFields;
            const filter = this.props.freeTextFilter.toLowerCase();
            data = data.filter(function (d, e) {
                for (var i = 0; i < ak.length; i++) {
                    if (d[ak[i]] && d[ak[i]].toString().toLowerCase().indexOf(filter) > -1) {
                        return true;
                    }
                }
                return false;
            });
        }
        
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
                        <th>&nbsp;</th>

                    </tr>
                </thead>
                <tbody>
                    {data.map((d) =>
                        <FilterSelectRow rowData={d} numFilters={numFilters} {...props} />
                    )}
                </tbody>
            </table>
        );
    }
}
/*
<AgencyRow agency={ai} onTableClick={onTableClick} selectedAgencies={selectedAgencies} />
Agencytable yleiseksi
-> thead ensimmäisen itemin avaimista
-> AgencyRow yleiseksi
    -> Klikkaamalla solua valitaan filtteri, filtteri laskee mätsäävät id:table
    -> Row:ssa solut mappiin avaimena key/field


*/
export default FilterSelectTable;
