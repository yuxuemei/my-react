import React, { Component } from 'react';

class Child extends Component {
  constructor(props){
     super(props);
     this.state = {
        checked: this.props.initialChecked,
        childName:'我是个孩子'
     }
     //改变this上下文
      //this.onTextChange = this.onTextChange.bind(this)
  }
  onTextChange() {
    var newState = !this.state.checked;
    this.setState({
      checked: newState,
    },()=>{
        console.log(this.state.checked);
        // 这里要注意：setState 是一个异步方法，所以需要操作缓存的当前值
        this.props.callbackParent(this.state);
    });
    
  }
  render() {
    // 从【父组件】获取的值
    var text = this.props.text;
    // 组件自身的状态数据
    var checked = this.state.checked;

    return (
        <label>{text}: <input type="checkbox" checked={checked}  onChange={(e)=>this.onTextChange(e)} /></label>
        /*<div onClick={(e)=>this.onTextChange(e)}>sssssssssssssss</div>*/
        )
  }
}

export default Child;
