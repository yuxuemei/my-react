import React, { Component } from 'react';

class Child extends Component {
  constructor(props){
     super(props);
     this.state = {
        name:'孩子'
     }
  }
  //组件加载完成
  componentDidMount(){
    console.log('componentDidMount === '+this.props.parent);
    /*this.setState({
      name:'yuxuemei'
    })*/
  }
  render() {
    return (
      <div className="child">
        <div>{this.state.name}</div>
      </div>
    );
  }
}

export default Child;
