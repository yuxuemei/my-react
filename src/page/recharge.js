import React, { Component } from 'react'
import { connect } from 'react-redux';
import Common from './../common.js'
import Slider from './../Silder/Slider.js';
import Exchange from './../components/exchange.js'
import store from '../redux/store.js'
import { exchange } from '../actions/plan.js'

import './recharge.css'

class Recharge extends Component{
  constructor (props) {
    super(props)
    this.state = {
        bannerList:[],
        goodsList:[],
        autoExchange:1,
        moneyNum: '',
        selectNum:-1,
        exchangeTicket:false 
   }
 }
  //组件加载完成
  componentDidMount() {
      this.getBanner();
      this.getGoodsList();
  }
  //banner导航
  getBanner(){
      Common.get({
          url:"/api/banner/list?delivery=11&categoryType=4"
      }).then(respose=>{
          this.setState({
              bannerList:respose
          })
      })
  }
  //充值列表
  getGoodsList(){
      Common.get({
          url:"/api/goods"
      }).then(respose=>{
          this.setState({
              goodsList:respose
          })
      })                
  }
  renderDiamonHtml(index){
    if(index >3){
        return(<img className="img" src="http://oslg9bt6h.bkt.clouddn.com/applet/img/cz003.png" alt="cz003"/>);
    }else if(index > 0 && index < 4){
        return(<img className="img" src="http://oslg9bt6h.bkt.clouddn.com/applet/img/cz002.png" alt="cz002"/>);
    }else if(index === 0){
        return(<img className="img" src="http://oslg9bt6h.bkt.clouddn.com/applet/img/cz001.png" alt="cz001"/>);
    }
  }
  //是否自动转换
  isAutochange(type){
      this.setState({
        autoExchange:type
      })
  }
  //选中充值金额
  getMoney(money,index){
      this.setState({
          selectNum:index,
          moneyNum:money
      })
  }
  openExchange(){
    var b = this.props.data.exchange;
    store.dispatch(exchange(!b))
  }
  render() {
      let user = this.props.data.user;
      let exchangeHtml;
      if(this.state.autoExchange){
          exchangeHtml = (<div className="choseyes"  onClick={this.isAutochange.bind(this,0)}></div>);
      }else{
          exchangeHtml = (<div className="chosenot" onClick={this.isAutochange.bind(this,1)}></div>);
      }
      return (
        <div className="recharge">
            <div className="retop">
                <div className="retop-box">
                    <div className="dsac">
                        <div className="my-money">我的门票 : {user.ticket}</div>
                        <div className="my-money-icon">
                            <img src="http://oslg9bt6h.bkt.clouddn.com/applet/img/cz-icon03.png" alt="cz-icon03"/>
                        </div>
                    </div>
                    <div className="retop-btn" onClick={this.openExchange.bind(this)}>
                        <div style={{marginTop:'0.05rem',color:'#fff'}}>兑换</div>
                    </div>
                </div>
            </div>
            <div className="reposter">
                <Slider items={this.state.bannerList} speed={1} delay={3} pause={true} autoplay={true} dots={true} arrows={false} />
            </div>
            <div className="remoney">
                {
                   this.state.goodsList.map((item,index)=>{
                      return(
                          <div key={index} className={`box dsajc rethone ${index === this.state.selectNum?'rethtwo':''}`}>
                            <div className="regq"></div>
                            <div className="zs-img dsajc">
                                {this.renderDiamonHtml(index)}
                            </div>
                            <div className="box-right dsajc">
                                <span className={index === this.state.selectNum?'text2':'text1'}>x{item.diamonds}</span>
                            </div>
                            <div className="box-bottom dsajc">
                                <span className={index === this.state.selectNum?'money2':'money1'}>￥{item.money}</span>
                            </div>
                        </div>
                      )
                   })
                }
            </div>
            <div className="reinput dsac">
                <input type="number" placeholder="请输入你要充值的金额" value={this.state.moneyNum}/>
            </div>
            <div className="rexchangetrak dsajc">
              <div className="dsajc">
                  {exchangeHtml}
                  <div className="chosetext">充值时自动转换为门票</div>
              </div>
          </div>
          <div style={{paddingBottom: '0.30rem'}}>
              <div className="rebottombtn dsajc">立即充值</div>
          </div>
          <Exchange store={store}/>
        </div>
      )
  }
}

const mapStateToProps = function (store){
    return {
      data: store.data
  };
};

export default connect(mapStateToProps)(Recharge)
