import Inferno from 'inferno';
import Component from 'inferno-component';


const FilterSelectCell = ({ content, field, id, selected }) => (
    <td data-field={field} data-id={id} className={selected ? 'selected' : ''}>{content}</td>
);

class FilterSelectRow extends Component {
    render({ tableFields, onTableClick, numFilters }) {

        const data = this.props.rowData;
        const idfield = this.props.dataIdField;

        const dataFilters = this.props.dataFilters;
        const dataType = this.props.dataType;

        var num_matching = 0;


        const fields = tableFields.map(function (fk) {
            const is_selected = dataFilters[dataType][fk] && data[fk] && dataFilters[dataType][fk].has(String(data[fk]).toLowerCase());
            if (is_selected) num_matching++;
            return { name: fk, selected: is_selected };
        });


        return (<tr onClick={onTableClick} class={numFilters > 0 && num_matching >= numFilters ? "table-success" : ""}>
            {fields.map(function (f) {
                const fk = f.name;
                const is_selected = f.selected;
                return <FilterSelectCell content={data[fk]} field={fk} id={data[idfield]} selected={is_selected} />;
            }
            )}
        </tr>);
    }
}


export default FilterSelectRow;