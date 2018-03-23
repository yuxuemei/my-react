import React, { Component } from 'react';

export default class SliderItem extends Component {

  render() {
    let { count, item } = this.props;
    let width = 100 / count + '%';
    return (
      <li className="slider-item" style={{width: width}}>
        <img src={item.imgpic} alt={item.title} className="banner-img"/>
      </li>
    );
  }
}