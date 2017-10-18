import Inferno from 'inferno';
import Component from 'inferno-component';
import Config from './config';
import CalendarTable from './calendar/CalendarTable.js';
import CalendarModal from './calendar/CalendarModal.js';
import './Modal.css';



class Calendar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            filter: {id:null},
            calendarModalVisible: false,
            calendarModalEditable: false,
            services: [],
            modalCalendar:null
        }


        if (props.dataFilters.trips.service_id !== undefined && props.dataFilters.trips.service_id.size > 0) {
            Object.assign(this.state,{ filter: Object.assign(this.state.filter, { id: Array.from(props.dataFilters.trips.service_id).join(',') }) });
        }

        this.onCreateNewRuleBtn = this.onCreateNewRuleBtn.bind(this);
        this.onCloseCalendarModal = this.onCloseCalendarModal.bind(this);
        this.onCalendarFilterChange = this.onCalendarFilterChange.bind(this);
        this.fetchCalendarData = this.fetchCalendarData.bind(this);
        this.visualizeCalendar = this.visualizeCalendar.bind(this);
    }


    componentDidMount() {

        this.fetchCalendarData()
    }

    fetchCalendarData() {
        console.log('fetchCalendarData', new Date(), 'filter', this.state.filter);
        var a = this;
        var query = [];

        if (this.state.filter.id) this.state.filter.id.split(',').map((i) => query.push('i=' + encodeURIComponent(i)));

        console.log('fetchCalendarData', 'query', query);

        fetch(Config.API_URL + 'calendar?' + query.join('&'))
            .then(function (response) {
                return response.json();
            }).then(function (json) {

                if (json.status !== "OK") {
                    a.setState({ error: json.error });
                    return true;
                }
                a.setState({ services: json.services });
            }).catch(function (ex) {
                console.log('parsing failed', ex)
            })

    }

    onCalendarFilterChange(e) {

        const name = e.target.name;
        const value = e.target.value;

        console.log('onCalendarFilterChange', name, value);
        console.log(Object.assign(this.state.filter, { [name]: value }));
        this.setState({ filter: Object.assign(this.state.filter, { [name]: value }) });

        if (this.fetchTimeout !== null) {
            clearTimeout(this.fetchTimeout);
            this.fetchTimeout = setTimeout(this.fetchCalendarData, 500);
            return true;
        }
        this.fetchTimeout = setTimeout(this.fetchCalendarData, 500);

    }

    onCreateNewRuleBtn(e) {
        this.setState({ calendarModalVisible: true, calendarModalEditable: true});
    }

    onCloseCalendarModal(e) {
        this.setState({ calendarModalVisible: false });
    }

    visualizeCalendar(calendar) {
        this.setState({calendarModalVisible:true,modalCalendar:calendar,calendarModalEditable:false})
        console.log('visualizeCalendar',calendar);
    }

    render(props) {
        console.log(this.state);



        const services = this.state.services;
        const fields = [
            'service_id',
            'mon',
            'tue',
            'wed',
            'thu',
            'fri',
            'sat',
            'sun',
            'start_date',
            'end_date'];
        var modal;
        if (this.state.calendarModalVisible) {
            modal = <CalendarModal calendar={this.state.modalCalendar} editable={this.state.calendarModalEditable} onCloseCalendarModal={this.onCloseCalendarModal} {...props}/>
        } else {
            modal = null;
        }
        return (
            <div className="App">
                <div className="row">
                    <div className="col">
                        <h2>Calendar {this.state.calendarModalVisible}</h2>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <input type="text" class="form-control" name="id" placeholder="Hae ID:llä" onInput={this.onCalendarFilterChange} value={this.state.filter.id} />
                    </div>
                    <div className="col">
                        <button onClick={this.onCreateNewRuleBtn}>Luo uusi sääntö</button>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <CalendarTable tableData={services} tableFields={fields} dataIdField="service_id" visualizeCalendar={this.visualizeCalendar} {...props} />
                    </div>
                </div>
                {modal}
            </div>
        );
    }
}

export default Calendar;
