import React, { Component } from "react";
import { withStyles } from "@material-ui/styles";
import DisplayTable from "./DisplayTable";
import styles from "./CovidAppStyles";
import axios from "axios";
// import "../styles/DarkModeButton.css";
import stateCodes from "../constants/stateCodes";
// import FadeIn from "react-fade-in";
// import Footer from "./Footer";


const months = {
  "01": "Jan",
  "02": "Feb",
  "03": "Mar",
  "04": "Apr",
  "05": "May",
  "06": "Jun",
  "07": "Jul",
  "08": "Aug",
  "09": "Sep",
  "10": "Oct",
  "11": "Nov",
  "12": "Dec",
};

class CovidApp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      todayData: {},
      isLoading: false,
      mapData: [],
      tableData: [],
    };

    this.fetchData = this.fetchData.bind(this);
    this.formatData = this.formatData.bind(this);
    this.findId = this.findId.bind(this);
    // this.handleFormat = this.handleFormat.bind(this);
    // this.handleNotification = this.handleNotification.bind(this);
  }

  componentDidMount() {
    this.fetchData();
  }

  async fetchData() {
    this.setState({ isLoading: !this.state.isLoading });
    const countryData = axios.get("https://api.covid19india.org/data.json");
    const districtLevel = axios.get(
      "https://api.covid19india.org/v2/state_district_wise.json"
    );
    const stateChanges = axios.get(
      "https://api.covid19india.org/states_daily.json"
    );
    const updates = axios.get(
      "https://api.covid19india.org/updatelog/log.json"
    );

    axios.all([countryData, districtLevel, stateChanges, updates]).then(
      axios.spread((...responses) => {
        const countryData = responses[0].data;
        const districtLevel = responses[1].data;
        // const stateChanges = responses[2].data;
        const updates = responses[3].data;

        // console.log(countryData.statewise[0].lastupdatedtime);

        const [todayData] = countryData.statewise.slice(0, 1);
        const casesTimeline = countryData.cases_time_series;

        const data = countryData.statewise.slice(1, -1);

        this.setState(
          {
            data: data,
            todayData: todayData,
            casesTimeline: casesTimeline,
            districtLevel: districtLevel,
            updates: updates,
            expanded: false,
          },
          this.handleFormat
        );
      })
    );
  }

  formatData(data) {
    const formatedData = data.map((state, i) => {
      return {
        id: this.findId(state.state),
        state: state.state.replace(" and ", " & "),
        value: state.confirmed,
      };
    });
    return formatedData;
  }

  findId(location) {
    for (let [key, value] of Object.entries(stateCodes)) {
      if (location === key) {
        return value;
      }
    }
  }

  formatDate(date) {
    try {
      const day = date.slice(0, 2);
      const month = date.slice(3, 5);
      const time = date.slice(11);
      return `${day} ${months[month]}, ${time.slice(0, 5)} IST`;
    } catch (err) {}
  }

  render() {
    const { classes, isDarkMode } = this.props;
    const {
      data,
      districtLevel,
    } = this.state;

    return (
        <>
          <div className={classes.header}>
            <div className={classes.tableContainer}>
              <h2 className={classes.tableHeading}>
                State Wise Data (Sortable){" "}
              </h2>
              <DisplayTable
                tableData={data}
                districtLevel={districtLevel}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>
        </>
      );
    }
  }
  
  export default withStyles(styles)(CovidApp);
  