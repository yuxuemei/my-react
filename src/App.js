import React, { Component } from 'react';
import { Router,Route } from 'react-router-dom'
//import logo from './logo.svg';
//import Child from './child';
//import ToggleButton  from './toggleButton';
//import Boo  from './boo';
//import Foo  from './foo';
// 引入公共js 
import Common from './common.js';

//引入store
import { Provider, connect } from 'react-redux';
import store from './redux/store.js'

// 引入样式文件
import './App.css'
import './components/component.css'
import 'antd-mobile/dist/antd-mobile.css';

// 引入模块页面
import Home from './page/home.js'
import Guess from './page/guess.js'
import Interaction from './page/interaction.js'
import Detail from './page/detail.js'
import Plan from './page/plan.js'
import My from './page/my.js'
import Detai from './page/detai.js'
import Login from './page/login.js'
import Recharge from './page/recharge.js'
// 引入组件
import Loading from './components/loading.js'
import Popup from './components/popup.js'
import TestRouter from './components/testrouter.js'
//引入路由
import createHistory from 'history/createBrowserHistory'
const history = createHistory();

class App extends Component {
  constructor(props){
     //获取this对象
     super(props);
     //console.log("parent");
     //console.log(props);
     this.state = {
        name:'父亲',
        age:0,
        price:0,
        checked: false,
        totalChecked: 0,
        bannerList:[]
     }
     //改变this上下文
     this.onChildChanged = this.onChildChanged.bind(this)
  }
  onChildChanged(newState){
    this.setState({
      checked:newState.checked
    })
    var newToral = this.state.totalChecked
      + (newState.checked ? 1 : -1);
    this.setState({
      totalChecked: newToral
    });
  }
  increaseAge(){
    this.setState({
      age:this.state.age+1
    })
  }
  
  //组件将被加载
  componentWillMount(){
    //console.log('componentWillMount === '+this.state.age);
  }
  //组件加载完成
  componentDidMount(){
    //console.log('componentDidMount === '+this.state.age);
    /*this.setState({
      name:'yuxuemei'
    })*/
  }
  //组件接收到新的props
  componentWillReceiveProps(nextProps){
     if(nextProps.name !== this.state.name){
         this.setState({
            name:nextProps.name
         })
     }
     //console.log('componentWillReceiveProps === '+nextProps);
  }
  //组件是否应该更新
  shouldComponentUpdate(nextProps,nextState){
     //console.log('shouldComponentUpdate === '+nextProps+','+nextState);
     //console.log(nextProps);
     //console.log(nextState);
     return nextState.age !== 3;
  }
  //组件将更新
  componentWillUpate(nextProps,nextState){
     //console.log('componentWillUpdate: ', this.state.age);
  }
  //组件已经更新
  componentDidUpate(prevProps,prevState){
     //console.log('componentDidUpate: ', this.state.age);
  }
  //组件将移除
  componentWillUnmount(){
     //console.log('componentWillUnmount: ', this.state.age);
  }
  render() {
    //var totalChecked =this.state.totalChecked;
    return (
      /*<div className="App">
        <p>{this.state.name}</p>
        <Child parent={this.state.name}></Child> 
      </div>

      <div>How many are checked: {totalChecked}</div>
        <ToggleButton text="Toggle me" initialChecked={this.state.checked} callbackParent={this.onChildChanged}/>
        <ToggleButton text="Toggle me too" initialChecked={this.state.checked}  callbackParent={this.onChildChanged} />
        <ToggleButton text="And me" initialChecked={this.state.checked} callbackParent={this.onChildChanged} />
        <Foo />
        <Boo />

      */
      <Provider store = {store}>
        <div className="App"> 
          <div> 
          <Router history = {history} >
             <div className="contentBox">
                <div className="content"> 
                  <Route exact path="/" component={Home}/>
                  <Route path="/guess" component={Guess}/>
                  <Route path="/interaction/:id" component={Interaction}/>
                  <Route path="/interactiondetail/:id" component={Detail}/>
                  <Route path="/plan" component={Plan}/>
                  <Route path="/my" component={My}/>
                  <Route path="/test" component={TestRouter}/>
                  <Route path="/detail/:id" component={Detai}/>
                  <Route path="/login" component={Login}/>
                  <Route path="/recharge" component={Recharge}/>
                </div>
            </div>
          </Router>
          </div>
          <Popup />
          <Loading />
        </div>
      </Provider>
    );
  }
}

export default App;
