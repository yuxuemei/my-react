import React, { Component } from 'react';
//import logo from './logo.svg';
//import Child from './child';
//import ToggleButton  from './toggleButton';
//import Boo  from './boo';
//import Foo  from './foo';
// 引入公共js 
//import Common from './common.js';
//引入store
import { Provider, connect } from 'react-redux';
import store from './redux/store.js'

// 引入样式文件
import './App.css'
import './components/component.css'

import { Router,Route,Link } from 'react-router-dom'
// 引入 homejs
import Home from './components/home.js'

// 引入4个模块组件
import Plan from './components/plan.js'
import Popup from './components/popup.js'
import TestRouter from './components/testrouter.js'
import Detail from './components/detail.js'
import Login from './components/login.js'
import Recharge from './components/recharge.js'

//引入路由
import createHistory from 'history/createBrowserHistory'
const history = createHistory();

class App extends Component {
  constructor(props){
     super(props);
     //console.log("parent");
     //console.log(props);
     this.state = {
        name:'父亲',
        age:0,
        price:0,
        checked: false,
        totalChecked: 0,
        bannerList:[],
        url:history.location.pathname
     }
     //改变this上下文
     this.onChildChanged = this.onChildChanged.bind(this)
     this.updateHandle = this.updateHandle.bind(this)
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
  //每次router变化之后都会触发
  updateHandle() { 
      this.setState({
        url:history.location.pathname
      })
  } 
  render() {
    //var totalChecked =this.state.totalChecked;
    var url = this.state.url;

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
                <ul className="bottom-nav" onClick={this.updateHandle} style={url==='/' || url==='/plan' || url==='/test'?{}:{display:'none'}}>
                  <li><Link to="/" className={url === '/' ? 'on' : ''}>首页</Link></li>
                  <li><Link to="/plan" className={url === '/plan' ? 'on' : ''}>计划表</Link></li>
                  <li><Link to="/test" className={url === '/test' ? 'on' : ''}>二级路由</Link></li>
                </ul>
                <div className="content"> 
                  <Route exact path="/" component={Home}/>
                  <Route path="/plan" component={Plan}/>
                  <Route path="/test" component={TestRouter}/>
                  <Route path="/detail/:id" component={Detail}/>
                  <Route path="/login" component={Login}/>
                  <Route path="/recharge" component={Recharge}/>
                </div>
            </div>
          </Router>
          </div>
          <Popup />
        </div>
      </Provider>
    );
  }
}

export default App;
