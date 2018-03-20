import React,{ Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'

class Footer extends Component{
  constructor (props) {
    super(props);
    this.state = {
       url:window.location.pathname
    };
    this.updateHandle = this.updateHandle.bind(this);
  }
  //每次router变化之后都会触发
  updateHandle() { 
      this.setState({
        url:window.location.pathname
      })
  } 
  render() {
    var url = this.state.url;
    var finishTaskNumber;
    if(finishTaskNumber>0){
        finishTaskNumber = (<span className="redDot-small center">{finishTaskNumber}</span>);
    }
    return (
        <div className="tab-bar z-footer z-fixed-bottom" onClick={this.updateHandle}>
            <Link to="/" className={`item center ${url === '/' ? 'act' : ''}`}>
                <div className="relative">
                    <img src={url === '/'?'http://oslg9bt6h.bkt.clouddn.com/vote/match-act.png':'http://oslg9bt6h.bkt.clouddn.com/vote/match.png'} alt="比赛"/>
                    <div className="tab-bar-name">比赛</div>
                </div>
            </Link>
            <Link to="/guess" className={`item center {'act':url === '/guess'}`}>
                <div className="relative">
                    <img src={url === '/guess'?'http://oslg9bt6h.bkt.clouddn.com/vote/guess-act.png':'http://oslg9bt6h.bkt.clouddn.com/vote/guess.png'} alt="预测"/>
                    <div className="tab-bar-name">预测</div>
                </div>
            </Link>
            <Link to="/plan" className={`item center {'act':url === '/plan'}`}>
                <div className="relative">
                    <img src={url === '/plan'?'http://oslg9bt6h.bkt.clouddn.com/vote/arena-act.png':'http://oslg9bt6h.bkt.clouddn.com/vote/arena.png'} alt="微竞技"/>
                    <div className="tab-bar-name">微竞技</div>
                </div>
            </Link>
            <Link to="/test" className={`item center {'act':url === '/test'}`}>
                <div className="relative">
                    <img src={url === '/test'?'http://oslg9bt6h.bkt.clouddn.com/vote/vs-act.png':'http://oslg9bt6h.bkt.clouddn.com/vote/vs.png'} style={{height:'.91rem'}} alt="我的比赛"/>
                    <div className="tab-bar-name">我的比赛</div>   
                </div>
            </Link>
            <Link to="/my" className={`item center {'act':url === '/my'}`}>
                <div className="relative">
                    <img src={url === '/my'?'http://oslg9bt6h.bkt.clouddn.com/vote/my-act.png':'http://oslg9bt6h.bkt.clouddn.com/vote/my.png'} style={{height:'.91rem'}} alt="我"/>
                    <div className="tab-bar-name">我</div> 
                    {finishTaskNumber}  
                </div>
            </Link>
        </div>
    )
  }
}

const mapStateToProps = function (store){
    return {
      data: store.data
    };
};

export default connect(mapStateToProps)(Footer)