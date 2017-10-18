import Inferno from 'inferno';
import Component from 'inferno-component';
import serialize from 'form-serialize';
import moment from 'moment';


moment.locale('fi');

class CalendarModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
            info: { matching: 0 }
        };
    }


    onRuleSubmit(e) {
        console.log(serialize(e.target, { hash: true }));
        e.preventDefault();
        return false;
    }

    render({ calendar, editable, dataFilters, onCloseCalendarModal, dataType }) {

        console.log('state', this.state);
        console.log(calendar);
        const exceptions = {};
        if (calendar.dates === null) calendar.dates = [];

        calendar.dates.forEach(function (d, i) {
            exceptions[d.date] = d.running
        });


        const startDate = moment(calendar.start_date);
        const endDate = moment(calendar.end_date);

        const dispCalendarStart = startDate.clone().startOf("month").startOf("isoweek");
        const dispCalendarEnd = endDate.clone().endOf("month").endOf("isoweek");

        console.log('dispCalendarStart', dispCalendarStart.format());
        console.log('dispCalendatEnd', dispCalendarEnd.format());

        var ddate = dispCalendarStart.clone();

        var calendars = [];

        for (var year = startDate.year(); year <= endDate.year(); year++) {
            var wkdHeaders = [];

            console.log('ddate', ddate.format());
            var wkdEnd = startDate.clone().endOf('month').endOf('isoweek');

            console.log('wkdEnd', wkdEnd.format());
            for (var d = ddate.clone(); d.isSameOrBefore(wkdEnd); d = d.add(1, 'day')) {
                wkdHeaders.push(<th>{d.format('dd')}</th>);
            }

            var months = [];

            var endMonth = startDate.clone().set('year', year).endOf('year') < dispCalendarEnd ? ddate.clone().set('year', year).endOf('year') : dispCalendarEnd.clone();
            var startMonth = year === startDate.year() ? startDate.clone() : startDate.clone().startOf("year").set("year", year);

            console.log('endMonth', endMonth.format());

            for (var m = startMonth.clone(); m.isBefore(endMonth); m = m.add(1, "month")) {
                var monthdays = [<td>{m.format("MMMM")}</td>];
                for (d = m.clone().startOf("month").startOf("isoweek"); d < m.clone().endOf("month").endOf("isoweek"); d = d.add(1, "day")) {
                    var isActiveDay = false;
                    var isException = false;
                    const isDisabled = d.month() !== m.month();
                    var dk = d.format('YYYY-MM-DD');

                    
                    isActiveDay = d.isSameOrAfter(startDate) && d.isSameOrBefore(endDate) && calendar[["mon", "tue", "wed", "thu", "fri", "sat", "sun"][d.isoWeekday() - 1]] === "true" ;
                    isException = exceptions[dk] !== undefined;
                    if (isException) {
                        if (exceptions[dk] === true) {
                            isActiveDay = true;
                        } else {
                            isActiveDay = false;
                        }
                    }

                    var cellClass;
                    if (isDisabled) {
                        cellClass = "dis";
                    } else {
                        cellClass = isActiveDay ? (isException ? "exyea" : "yes") : (isException ? "exno" : "");
                    }
                    monthdays.push(<td className={cellClass}>{isDisabled?" ":d.format('D')}</td>);
                }

                months.push(<tr>{monthdays.map((md) => md)}</tr>);
            }
            var ycal = (<table className="table table-sm table-bordered calendar-table">
                <tr>
                    <th>{year}</th>
                    {wkdHeaders.map((h) => h)}
                </tr>
                {months.map((m) => m)}
            </table>);
            calendars.push(ycal);
        }


        return (<div className="form-modal calendar-modal">
            <h3 onClick={onCloseCalendarModal}>Kalenteri id {calendar.service_id}</h3>
            <div className="row">
                <div className="col">
                    <strong>Voimassaolo:</strong> {calendar.start_date} -  {calendar.end_date}
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <h4>Viikonpäivät</h4>
                    <div className="row">
                        {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((wkd) => <div className="col">{wkd}</div>)}
                    </div>
                    <div className="row">
                        {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((wkd) => <div className="col"><input type="checkbox" checked={calendar[wkd] === "true"} /></div>)}
                    </div>
                    <div className="row">
                        <div className="col">
                            <h4>Poikkeuspäivät</h4>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <strong>Ei ajeta:</strong> {calendar.dates.filter((d) => !d.running).length} kpl
                        </div>
                        <div className="col">
                            <strong>Ajetaan:</strong> {calendar.dates.filter((d) => d.running).length} kpl
                        </div>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <h4>Kalenteri</h4>
                    {calendars.map((c) => c)}
                </div>
            </div>
        </div>);
    }
}


export default CalendarModal;