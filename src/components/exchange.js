import React, { Component } from 'react'
import { connect } from 'react-redux';
import { Link } from 'react-router-dom'
import Common from './../common.js'
import { exchange } from '../actions/plan.js'
import './exchange.css'

class Exchange extends Component{
  constructor (props) {
    super(props)
    this.state={
        user:{},
        moneyNum:'',
        tickNum:0,
        diamonds:this.props.data.user.diamonds
    }
    this.exchangeTicket = this.exchangeTicket.bind(this);
    this.closeBox = this.closeBox.bind(this);
    this.getNum = this.getNum.bind(this);
  }
  //兑换接口
  exchangeTicket(){
    if(this.state.moneyNum){
       Common.post({
          url:'/api/currency/exchang',
          data:{
            getType:4,
            type:2,
            gold:this.state.moneyNum
          }
        }).then(respose=>{
            Common.getUserInfo();
            this.closeBox();
            Common.success('兑换成功!')
        })
    }else{
      Common.fail("请输入兑换的钻石数量！");
    }
    
  }
  handelInNumber(num){
    let myDiamond = this.props.data.user.diamonds;
    this.setState({
       moneyNum:num,
       diamonds:myDiamond - num,
       tickNum:num*100
    })
  }
  //兑换数量
  getNum(e){
      this.setState({
          moneyNum:e.target.value,
          diamonds:this.props.data.user.diamonds - e.target.value,
          tickNum:e.target.value*100
      })  
  }
  //关闭对话框
  closeBox(){
    var b = this.props.data.exchange;
    this.props.store.dispatch(exchange(!b));
  }
  render() {
    let moneyNum = this.state.moneyNum;
    let submitHtml;
    if(this.state.diamonds>=0){
        submitHtml = (<div className="opera-btn center" onClick={this.exchangeTicket}>确认转换</div>);
    }else{
        submitHtml = (
              <div className="opera-btn center">
                  <Link to="/recharge" style={{color:'#fff'}}>去充值{-(this.state.diamonds)}钻石</Link>
              </div>
          );
    }
    return (
        <div className="popup z-fixed" style={this.props.data.exchange?{}:{display:'none'}}>
          <div className="bomb-box">
              <div style={{overflow:'hidden'}}><img src="http://oslg9bt6h.bkt.clouddn.com/applet/img/close.png" className="img-close" alt="close" onClick={this.closeBox} /></div>
              <div className="line"></div>
              <div className="box text-left">
                  <span className="title">剩余钻石：</span><span style={{color:'#da5c34'}}>{this.state.diamonds}</span> <span className="proportion">（1钻石=100门票）</span>  
                  <div className="form">
                      <input type="number" placeholder="输入要兑换的钻石数量" value={moneyNum} className="box-inpupt" onChange={this.getNum}/>  
                      <div className="all" onClick={this.handelInNumber.bind(this,this.state.diamonds)}>全部</div>
                  </div>
                  <div className="data">
                      <span className={moneyNum===100?'selected':''} onClick={this.handelInNumber.bind(this,100)}>100</span> 
                      <span className={moneyNum===500?'selected':''} onClick={this.handelInNumber.bind(this,500)}>500</span> 
                      <span className={moneyNum===1000?'selected':''} onClick={this.handelInNumber.bind(this,1000)}>1000</span> 
                      <span style={{marginRight:'0'}} className={(moneyNum===5000)?'selected':''} onClick={this.handelInNumber.bind(this,5000)}>5000</span>  
                  </div>
                  <div className="surplus">
                      <span>可转换门票：</span>
                      <span>{moneyNum*100}</span>
                      <img src="http://oslg9bt6h.bkt.clouddn.com/applet/img/ticket.png" className="image-ticket" style={{marginLeft:'.06rem'}} alt="ticket"/>
                  </div>
                  {submitHtml}
              </div> 
        </div>
      </div>
    )
  }
}

const mapStateToProps = function (store){
    return {
      data: store.data
    };
};

export default connect(mapStateToProps)(Exchange)
