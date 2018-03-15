import React, { Component } from 'react'
import { connect } from 'react-redux';
import './loading.css'

class Pupop extends Component{
  constructor (props) {
    super(props)
    this.state={
        style:{
            height:0
        }
    }
  }
  componentDidMount(){
    var heightRem = window.innerHeight;
    this.setState({
        style:{
            height:heightRem+'px'
        }
    })
  }
  render() {
    return (
        <div  style={this.props.data.loading?{}:{display:'none'}}>
            <div className="center absolute loading-area">
                <svg className="loading" width="44px" height="44px" viewBox="0 0 44 44">
                    <circle className="path" fill="none" strokeWidth="4" strokeLinecap="round" cx="22" cy="22" r="20"></circle>
                </svg>
                <div className="loading-text">玩儿命加载中...</div>
            </div>
            <div className="loading-bg fixed" style={this.state.style}></div>
        </div>
    )
  }
}

const mapStateToProps = function (store){
    return {
      data: store.data
    };
};

export default connect(mapStateToProps)(Pupop)
