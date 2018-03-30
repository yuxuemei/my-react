import React, { Component } from 'react'
import { connect } from 'react-redux';
import { Link } from 'react-router-dom'
import Common from './../common.js'
import store from '../redux/store.js'
import { bet } from '../actions/plan.js'
import './exchange.css'

class Bet extends Component{
  constructor (props) {
    super(props)
    this.state={
        guessObj:'',
        selectBetObj:{},
        newItemId:'',
        earnings:0, //收益
        guessBigId:'',//竞猜id
        user:this.props.data.user,
        betNumber:'', //下注数量
        isRecharge:false, //是否需要去充值
        guessType:'', //是否是全押
        autoExchange:true, //是否自动兑换门票 默认勾选自动兑换
        balanceDiamond:this.props.data.user.diamonds, //剩余钻石
        isRquest:true,
        myWallet:0, //我的钱包初始化值(根据不同类型取值)
        guessingItemId:'',//竞猜小项id
        guessId:this.props.guessId,
        guessChildId:this.props.guessChildId,
        betteam:this.props.betteam
    }
  }
  //组件接收到新的props
  componentWillReceiveProps(nextProps){
     if(nextProps.guessChildId !== this.state.guessChildId){
         this.setState({
            guessId:nextProps.guessId,
            guessChildId:nextProps.guessChildId,
            betteam:nextProps.betteam
         },()=>{
            this.getGuessDetail();
         })
     }
     //console.log('componentWillReceiveProps === '+this.props.guessId,nextProps);
  }
  getGuessDetail(){
    Common.get({
        url: '/api/guessinfo/show/' + this.state.guessId,
    }).then(respose=>{
        this.setState({
           guessObj:respose,
           guessBigId:respose.guessing_id,
           guessId:respose.guessing_id //获取竞猜项的id
        })
         if(respose.bet_currency_type === 1){
              this.setState({
                 myWallet:this.state.user.gold
              })
         }else if(respose.bet_currency_type === 2){
             this.setState({
                 myWallet:this.state.user.diamonds
              })
         }else if(respose.bet_currency_type === 3){
            this.setState({
                 myWallet:this.state.user.crystal
              })
         }else if(respose.bet_currency_type === 4){
              this.setState({
                 myWallet:this.state.user.ticket
              })
         }
        var obj = {};
        respose.team.map((item, key) =>{
            if(this.state.betteam === item.title){
                obj = item;
            }
            if(item.status>0){
                this.setState({
                   oldItemId:item.id
                })
            }
        });
        this.setState({
            selectBetObj:obj
        })
    })
  }
  closeBetBox(){

    var b = this.props.data.bet;
    this.setState({
      newItemId : '',
      betNumber : ''
    },()=>{
        store.dispatch(bet(!b))
    })
  }
  handelInTicket(guessType){
    let number,betNum; 
    let type = this.state.guessObj.bet_currency_type;
    let user = this.state.user;
    //全押
    if(guessType === "all"){
        if(type === 1){
             number = user.gold;
         }else if(type === 2){
             number = user.diamonds;
         }else if(type === 3){
             number = user.crystal;
         }else if(type === 4){
             number = user.ticket;
         }
        this.setState({
            guessType:'all',
            balanceDiamond:0 //全押之后剩余钻石就为0了
        })
        //是否自动兑换成门票
        if(this.state.autoExchange){
              betNum = number + (this.state.balanceDiamond*100);
        }else{
             betNum = parseInt(this.state.betNumber,10)+parseInt(number,10);
        }
    }else{
        number = guessType;
        if(parseInt(this.state.betNumber,10)){
              betNum = parseInt(this.state.betNumber,10)+parseInt(number,10);
        }else{
              betNum = parseInt(number,10);
        }
    }
    this.setState({
       betNumber:betNum
    },()=>{
       this.calculation();
    })
  }
  inputInTicket(e){
    this.setState({
        betNumber:parseInt(e.target.value,10)
    },()=>{
        this.calculation();
    })
  }
  clearTicket(){
      this.setState({
          betNumber:'',
          isRecharge:false
      })
  }
  /*
   *收益计算函数
   * bet_currency_type:'', //竞猜下注类型
   * settlement_currency_type:'', //竞猜获得类型
   * bet_currency_value:'', //竞猜下注比例
   * settlement_currency_value:'', //竞猜获得比例
   */
  calculation(){
      var allEarnings = parseInt(this.state.betNumber,10)/this.state.guessObj.bet_currency_value*this.state.guessObj.settlement_currency_value*this.state.selectBetObj.odds;
      //如果是金币就整数否则保留两位小数
      if(this.state.guessObj.settlement_currency_type === 2){
          this.setState({
               earnings:allEarnings.toFixed(2)
          });
      }else{
          this.setState({
               earnings:allEarnings.toFixed(0)
          });
      }
  }
  //预测
  guessBet(type) {
      if(this.state.autoExchange === 1 && this.state.user.ticket-this.state.betNumber<0){
          this.autoExchangeTicket(()=>{
              this.guessBetRequest(type);
          });
      }else{
        this.guessBetRequest(type);
      }
  }
  autoExchangeTicket(diamond,callback){
      Common.post({
          url: '/api/currency/exchang',
          data: {
              type:2,
              gold:(this.state.betNumber-this.state.user.ticket)/100, 　
              getType:4
          },
        }).then(respose=>{
              Common.getUserInfo();
              callback();
        })
  }
  //竞猜下注提交
  guessBetRequest(type){
      if(parseInt(this.state.betNumber,10) > 0){
          if(this.state.isRquest){
              //单击之后屏蔽按钮
              this.setState({
                  isRquest:false
              })
              Common.post({
                  url: type === 1?"/apivtwo/guessinfo/addbet":"/apivtwo/guessinfo/bet",
                  data: {
                    guessId: this.state.guessId, //竞猜ID
                    guessingItemId: this.state.guessChildId, //获取下注小项的id
                    guessingItemInfoId: this.state.selectBetObj.id,
                    gold: parseInt(this.state.betNumber,10),
                    odds: this.state.selectBetObj.odds
                  },
                  popupInfo:false
                }).then(respose=>{
                    this.closeBetBox(true);
                }).catch(error=>{
                    this.setState({
                        isRquest:true
                    })
                     if(error.status === 201){
                          Common.fail('当前赔率已变动，请重新下注');
                          this.getGuessDetail();
                      }else{
                          Common.fail(error.data.info);
                      }
                      if (error.data.info === "老板,您的余额不足,请充值!"){
                          this.closeBetBox(false);
                      }
                })
          }
      }else{
          //空白提示
          Common.fail('老板，请输入预测数量！');
      }
  }
  renderCurrency(settlement_currency_type){
      if(settlement_currency_type === 1){
           return(<span>金币)</span>);
      }else if(settlement_currency_type === 2){
           return(<span>钻石)</span>);
      }else if(settlement_currency_type === 3){
           return(<span>水晶)</span>);
      }else if(settlement_currency_type === 4){
           return(<span>水晶)</span>);
      }
  }
  checkHandle(){

  }
  render() {
    let buttonHtml;
    if(!this.state.isRecharge && this.state.guessObj.total_gold === 0){
       buttonHtml = (
           <div className="btn" onClick={this.guessBet.bind(this,2)}>
                <span style={{fontSize:'.26rem'}}>立即预测</span>
                <span>(预计收益：{this.state.earnings}</span>
                {this.renderCurrency(this.state.guessObj.settlement_currency_type)}
            </div>
        )
    }else if(!this.state.isRecharge && this.state.guessObj.total_gold > 0){
        buttonHtml = (
          <div className="btn" onClick={this.guessBet.bind(this,1)}>
              <span style={{fontSize:'.26rem'}}>立即追加</span>
              <span >(预计收益：{this.state.earnings}</span>
              {this.renderCurrency(this.state.guessObj.settlement_currency_type)}
          </div>
        )
    }else if(this.state.isRecharge){
       buttonHtml  = (
          <div className="btn" style={{backgroundColor:'#9b261d'}}>
              <Link to="/recharge">
                前往充值（{this.state.needDiamond-this.state.user.diamonds}钻石）
              </Link>
          </div>
        )
    }
    let user = this.state.user;
    let bet = this.props.data.bet;
    let controller;
    if(bet){
       controller = (
          <div className="bomb-box bet-box">
            <div style={{overflow:'hidden'}}><img src="http://oslg9bt6h.bkt.clouddn.com/applet/img/close.png" className="img-close" alt="close" onClick={this.closeBetBox.bind(this)}></img></div>
            <div className="line"></div>
            <div className="box" style={{paddingBottom:'.3rem'}}>
                <div className="center">
                     <span className="title">预测：{this.state.selectBetObj.title}</span> <span className="proportion">（赔率{this.state.selectBetObj.odds}）</span>  
                </div>
                <div style={{marginTop:'.4rem'}}>
                     <span className="title">钱包：</span><span>{this.state.myWallet-this.state.betNumber}</span>
                     <img className={this.state.guessObj.bet_currency_type !== 4?'image-diamond':'image-ticket'} alt="currency" src={Common.CURRECY[this.state.guessObj.bet_currency_type-1]} style={{marginLeft:'5px'}}></img>

                     <span style={{fontSize:'.2rem'}}>（已预测：{this.state.guessObj.total_gold}）</span>
                </div>
                <div className="form relative">
                    <input type="number" placeholder="输入预测的数量" value={this.state.betNumber} className="box-inpupt" onChange={this.inputInTicket.bind(this)}/>  
                    <div className="all center" v-if="guessObj.bet_currency_type === 1" onClick={this.handelInTicket.bind(this,'all')}>全押</div>
                </div>
                <div className="data">
                    <span className={this.state.betNumber===100?'selected':''}  onClick={this.handelInTicket.bind(this,100)}>100</span> 
                    <span className={this.state.betNumber===500?'selected':''}  onClick={this.handelInTicket.bind(this,500)}>500</span> 
                    <span className={this.state.betNumber===1000?'selected':''} onClick={this.handelInTicket.bind(this,1000)}>1000</span> 
                    <span style={{marginRight:'0'}}  onClick={this.clearTicket.bind(this)}>清空</span>  
                </div>
                <div className="surplus center">
                    <span>剩余钻石：</span>
                    <span>{this.state.balanceDiamond}</span>
                    <span style={user.ticket-this.state.betNumber<0?{marginLeft:'.1rem'}:{display:'none'}}>兑换门票：</span>
                    <span style={user.ticket-this.state.betNumber<0?{}:{display:'none'}}>{this.state.betNumber-user.ticket}</span>
                </div>
                {buttonHtml}
                <div style={{marginTop:'.3rem',color:'#5d5562',fontSize:'.26rem'}} className="center">
                    <label className="radio">
                        <input type="checkbox" checked="checked" value={this.state.autoExchange} style={{verticalAlign:'-.02rem'}} onChange={this.checkHandle.bind(this)}/>门票不足钻石自动兑换
                    </label>
                </div>
            </div> 
          </div>
       )
    }
    return (
        <div className="popup z-fixed" style={this.props.data.bet?{}:{display:'none'}}>
            {controller}
        </div>
    )
  }
}

const mapStateToProps = function (store){
    return {
      data: store.data
    };
};

export default connect(mapStateToProps)(Bet)
