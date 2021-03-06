/* Demo for FinTech@SG Course 
Generation of Charts Based on JSON data from Server
Author: Prof Bhojan Anand */
//Install d3.js:   npm install d3 --save
import React from "react";
import logo from "./brand-logo.png";
import * as d3 from 'd3' 

import "./App.css";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data: [], transactions: [] };
  }

  callAPIServer() {
    // when component mounted, start a GET request
    // to specified URL
    fetch("https://f92c6b35-d121-4c8a-987b-81217155297f.mock.pstmn.io/accounts")
      .then(res => res.json())
      .then(res => this.setState({ data: res }))
      .catch(err => err);

    // transactions
    fetch("https://f92c6b35-d121-4c8a-987b-81217155297f.mock.pstmn.io/transactions")
      .then(res => res.json())
      .then(res => this.setState({ transactions: res }))
      .catch(err => err);

  }
  
  componentDidMount() {
    // react lifecycle method componentDidMount()
    //will execute the callAPIserver() method after the component mounts.
    this.callAPIServer();
  }
 

 componentDidUpdate() {
  
  /* prepare data */
  this.state.data.forEach(function (d) {
    d.balance = d.balance.replace(/[^0-9.-]+/g,"");  //regular expression to convert currency to Numeric form
  });
  console.log(this.state.data);

  this.state.transactions.forEach((d) => {
    d.amount = d.amount.replace(/[^0-9.]+/g,"");
  });

  console.log(this.state.transactions);
  
  this.generateGraph();  //based on previous d3.js exampls
  this.showChart();  //improved version way to chart
  this.transactions();

}

showChart() {

  
  const margin = { top: 50, right: 50, bottom: 50, left: 50 };
  var width = 1000 - margin.left - margin.right;
  var height = 500 - margin.top - margin.bottom;
  var svg = d3.select("#barChart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  
  svg.selectAll("*").remove();

  var x = d3.scaleBand().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);

  x.domain(this.state.data.map(details => details.account));
  y.domain([0, d3.max(this.state.data.map(details => details.balance))]);



  svg.selectAll(".bar")
    .data(this.state.data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.account))
    .attr("width", x.bandwidth() - 10)
    .attr("y", d => y(d.balance))
    .attr("height", d => height - y(d.balance));

  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))

  svg.append("g")
    .call(d3.axisLeft(y));
}

  generateGraph() {

    var maxVal = d3.max(this.state.data.map(details => Number(details.balance)));
    console.log(maxVal);
    var svg = d3
      .select("#visualisation")
      .append("svg")
      .attr("width", 500)
      .attr("height", 200);

    svg
      .selectAll("rect")
      .data(this.state.data)
      .enter()
      .append("rect")
      .attr("transform", function (d, i) {
        return "translate(" + 60 + "," + i * 25 + ")";
      })
      .attr("fill", "blue")
      .attr("height", 20)
      .attr("width", function (d) {
        return d.balance /maxVal * 500 + "px";
      });
      
    svg
      .selectAll("text")
      .data(this.state.data)
      .enter()
      .append("text")
      .attr("transform", function (d, i) {
        return "translate(0," + Number(i * 25 + 15) + ")";
      })
      .attr("fill", "red")
      .text(function (d) {
        return d.account;
      });    
  } 

  transactions() {
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    var width = 1000 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;
    var svg = d3.select("#transactions")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    var radius = Math.min(width, height) / 2;

    var trans = this.state.transactions

    var transactions_data = Object.values(trans.reduce((c, {category,amount}) => {
      c[category] = c[category] || {category,amount: 0};
      c[category].amount += parseInt(amount);
      return c;
    }, {}));
    
    //The <g> SVG element is a container used to group other SVG elements.
    var g = svg.append("g")
          .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  // set the color scale  
    var color = d3.scaleOrdinal(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00", "#394867"]);

    // Compute the position of each group on the pie:   
    var pie = d3.pie()
        .value(function(d) { 
          return d.amount; 
      });
    console.log(pie);

    //radius for the arc   
    var path = d3.arc()
          .outerRadius(radius - 10)
          .innerRadius(0);
    
    //radius for the label      
    var label = d3.arc()
          .outerRadius(radius).innerRadius(radius - 80);
        
    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    var arc = g.selectAll(".arc")
        .data(pie(transactions_data))
        .enter()
        .append("g")
        .attr("class", "arc");
    
    var arc2 = g.selectAll(".arc2")
        .data(pie(transactions_data))
        .enter()
        .append("g")
        .attr("class", "arc");

    arc.append("path")
        .attr("d", path)
        .attr("fill", function(d) { return color(d.data.amount); });

        //console.log(arc);
  
    arc2.append("text").attr("transform", function(d) { 
        return "translate(" + label.centroid(d) + ")"; 
    })
          
          .text(function(d) { return d.data.category; });
          
    };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">NUSmoney App by Anuflora Bank</h1>
        </header>

        <table className="myTable">
          <tbody>
          {this.state.data.map((item) => {
            return (
              <tr key={item.id}>
                <td> {item.account} </td>
                <td> {item.balance} </td>
              </tr>
            );
          })}
          </tbody>
        </table>
        

        <h2> Visualisation of Data</h2>
        <div id="visualisation">
            <svg id="barChart"></svg>
        </div>
        <h2>Transactions</h2>
        <div>
          <svg id="transactions"></svg>
        </div>
      </div>
    );
  }
}

export default App;
