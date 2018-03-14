import React,{ Component } from 'react'
import { connect } from 'react-redux';

//引入定义的action
import { user } from '../actions/plan.js'

import './home.css';

import Common from './../common.js'
import {
  Route,
  Link
} from 'react-router-dom'
import Slider from './../Silder/Slider.js';

class Home extends Component {
	constructor(props){
        super(props);
        this.state = {
        	banner:[{
					id: 102, 
					imgpic: "http://oslg9bt6h.bkt.clouddn.com/uploads/images/1516000780129",
					address:"http://91war.com/news/detail/135",
					src:"http://oslg9bt6h.bkt.clouddn.com/uploads/images/1516000780129",
					title:"新手教程"
				},{
					id: 94, 
					imgpic: "http://oslg9bt6h.bkt.clouddn.com/uploads/images/1515743217523",
					address:"http://91war.com/news/detail/129",
					src:"http://oslg9bt6h.bkt.clouddn.com/uploads/images/1515743217523",
					title:"国庆"
			}],
			mateNumber:0,
			gameClassify:[],
			gameClassifyChild:{}, //首页二级分类和置顶互动赛
			gameId:'',
			childLength:0,
			classIsShow:false, //二级分类默认不显示
			curreny:['http://oslg9bt6h.bkt.clouddn.com/applet/img/diamond-header.png','http://oslg9bt6h.bkt.clouddn.com/applet/img/crystal-header.png','http://oslg9bt6h.bkt.clouddn.com/applet/img/ticket-header.png']
		}
    }
    //组件加载完成
	componentDidMount(){
	    this.banner();
	    this.getMateNumber();
	    this.getGameClassify();
	}
	banner(){
		var res = Common.get({
			url:'/api/banner/list?delivery=11&categoryType=2'
		}).then(response=>{
			this.setState({
				banner:response
			})
		});
	}
	getMateNumber(){
    	Common.get({
            url:'/apivtwo/matchnum'
        }).then(respose=>{
            this.setState({
				mateNumber:respose.total
			})
        })
    }
    getGameClassify(){
        Common.get({
            url:'/apivtwo/games/lists'
        }).then(respose=>{
            this.setState({
				gameClassify:respose
			})
        })
    }
    getChildClassify(){
	    Common.get({
	        url:'/apivtwo/games/sortinfo?games_id='+this.state.gameId
	    }).then(respose=>{
	        var num = 0;
	        if(respose.gamesType.exist){
	            num = respose.gamesType.exist.length;
	        }else{
	        	//避免exist不存在时map报错
	        	respose.gamesType.exist = [];
	        }
	        if(respose.gamesType.nonexist){
	            num += parseInt(respose.gamesType.nonexist.length);
	        }else{
	        	//避免nonexist不存在时map报错
	        	respose.gamesType.nonexist = [];
	        }
	        this.setState({
				gameClassifyChild:respose,
				childLength:num
			})
	    })
	}
    showTopMatch(id){
        if(this.state.gameId == id  && this.state.classIsShow){
      		this.setState({
				classIsShow:!this.state.classIsShow,
				gameId:''
			})
      	}else{
      		this.setState({
				classIsShow:true,
				gameId:id
			}, () => {
				//在回调中state才改变了
			    this.getChildClassify();
			})
      	}
    }
    renderChild(id) { // 如果这里有多行，推荐用这种方法
    	var gameClassifyChild = this.state.gameClassifyChild;
	    if ((this.state.classIsShow && this.state.gameId == id) && (this.state.childLength>0)){
	    	return(
                <div className="class-controller">
                    <div className="top-game">
                    { 
                    	gameClassifyChild.competitions.map((competition,idx)=>{
                            return (
								<div key={idx} className="relative">
		                            <img className="icon-hot absolute" src="http://oslg9bt6h.bkt.clouddn.com/applet/img/icon_hot.png"></img>
		                            <Link className="top-item" to="'/interaction/detail/'+competition.id">
		                                <div>
		                                <span className="dot"></span><span>{competition.title}</span>
		                                { competition.apply == 1 ?<span className="apply center">已参加</span>:''}
		                                </div>
		                                <div>
		                                    <div className="totals">
		                                        {competition.totals}
		                                        <img src={this.state.curreny[competition.reward_type-2]} className="crystal-header"></img>
		                                    </div>
		                                    <div className="totals-title text-right">奖金总额</div>
		                                </div>
		                            </Link>
		                        </div>
                            )
                        })
                    }
                    </div>
                    <div className="two-classify">
                        {   
                    		gameClassifyChild.gamesType.exist.map((sort,index)=>{
                                return (
                                    <Link key={index} className="top-item exist" to="'/interaction?id='+sort.id">
		                                <div><span className="dot"></span><span>{sort.name}</span></div>
		                                <div><img src="http://oslg9bt6h.bkt.clouddn.com/applet/img/icon1_arrow.png" className="arrow-03"/></div>
		                            </Link>
                                )
                            }),
                            gameClassifyChild.gamesType.nonexist.map((sort,index)=>{
                                return (
                                    <div key={index} className="top-item">
		                                <div><span className="dot nonexist"></span><span>{sort.name}</span></div>
		                                <div><img src="http://oslg9bt6h.bkt.clouddn.com/applet/img/icon1_arrow_grey.png" className="arrow-03"/></div>
		                            </div>
                                )
                            })
                        }
                    </div>
                </div>
	    	)
	    }
	}
	render(){
		var user = this.props.data.user;
		var state = this.state;
		return (
			<div className="home">
			    <div className="header">
			        <div>我的钱包：</div>
			        <div className="currency relative">
			        	<img className="header-icon absolute" src={require('./../images/diamond-header.png')} alt="钻石" />
			        	<span className="curreny-number">{user.diamonds || 0}</span>
			        </div>
			        <div className="currency relative">
			        	<img className="header-icon absolute" src={require('./../images/ticket-header.png')} alt="门票" />
			        	<span className="curreny-number">{user.ticket || 0}</span>
			        </div>
			        <div className="currency relative">
			        	<img className="header-icon absolute" src={require('./../images/crystal-header.png')} alt="水晶" />
			        	<span className="curreny-number" >{user.crystal || 0}</span>
			        </div>
			        <div>
			            <Link to={user.uid?'/recharge':'/login'} className="recharge-btn center" >{ user.uid ?  '充值' : '登录' }</Link>
			        </div>
			    </div>
			    <div className="banner">
			        <Slider items={this.state.banner} speed={1} delay={3} pause={true} autoplay={true} dots={true} arrows={false} />
			    </div>
			    <Link className="enterMate relative" to={user.uid?'/mate':'/login'}>
		           <img src="http://oslg9bt6h.bkt.clouddn.com/applet/img/mate.png" className="image-mate"></img>
		           <span className="absolute mate-number">{this.state.mateNumber}人正在匹配...</span>
		        </Link>
		        <div className="home-classify">
		           {
                        state.gameClassify.map((item,index)=>{
                            return (
								<div key={index} className={`item ${(state.gameId == item.id) && (state.childLength>0) ? 'act' : ''}`} 
								 style={{'backgroundImage':'url('+((state.gameId==item.id) && (state.childLength>0)?item.miniapp_bg2:item.miniapp_bg1)+')','height':((state.gameId== item.id) && (state.childLength>0))?'':'1.5rem'}}>
					                <div className="class-big relative" onClick={this.showTopMatch.bind(this,item.id)}>
					                    <div className="absolute classify-info">
					                        <span>{item.competitionNum || 0}个房间</span>
					                        <span className="line"></span>
					                        <span>{item.peopleNum || 0}人正在参与...</span>
					                    </div> 
					                </div>
					                {this.renderChild(item.id)}
					           </div>
                            )
                        })
                    }
		        </div>
			</div>
		)
	}
}
const mapStateToProps = function(store){
    return {
        data:store.data
    };
};

export default connect(mapStateToProps)(Home);