import React, { Component } from 'react';

export default class SliderDots extends Component {
  handleDotClick(i) {
    var option = i - this.props.nowLocal;
    this.props.turn(option);
  }

  render() {
    let dotNodes = [];
    let { count } = this.props;
    for(let i = 0; i < count; i++) {
      dotNodes[i] = (
        <span
          key={'dot' + i}
          className={"slider-dot" + (i === this.props.nowLocal?" slider-dot-selected":"")}
          onClick={this.handleDotClick.bind(this, i)}>
        </span>
      );
    }
    var width = this.props.count*14;
    return (
      <div className="slider-dots-wrap" style={{width:width}}>
        {dotNodes}
      </div>
    );
  }
}