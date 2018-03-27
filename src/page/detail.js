import React,{ Component } from 'react'
import { connect } from 'react-redux';
import Common from './../common.js'
import { Link } from 'react-router-dom'
import { Carousel } from 'antd-mobile'
import Countdowm from './../components/countdown.js'
import './detail.css';

class Detail extends Component {
	constructor(props){
        super(props);
        this.state = {
        	id:this.props.match.params.id,
			match:{}, //赛事对象
			currency:Common.CURRECY, //货币图标
			applyed:[], //参赛玩家列表
			rules:[],//规则说明
			tabIndex:0,
			lineups:[],
			bg:'',
			userTabIndex: 0,
			allPowerNumber:0, //总战力
			applyId:'',
			sessionId:'',
			playerDataList:[],
			activityData:[],
			activity_rule:[],
			activity_club:[]
        }
	}
    componentDidMount(){
    	this.getMatchDetail(this.state.id);
    }
    getMatchDetail(id){
		Common.get({
            url:'/api/activity/info/'+id
        }).then(respose=>{
            if (respose.activity_rule) {
                respose.activity_rule.map((item, key)=>{
                    respose.activity_rule[key] = {
                        name: item.split(' ')[0],
                        money: item.split(' ')[1]
                    };
                });
            }
            this.setState({
            	match:respose,
            	activity_rule:respose.activity_rule
            });
            if(respose.apply){
                if (respose.apply.length) {
                    this.setState({
		            	applyId:respose.apply[0].id
		            });
                    respose.apply.map((item, key)=>{
                        if(item.rank === respose.my_sort[0].rank){
                            this.setState({
                            	myApplyId:item.id
                            });
                        }
                    });
                }
            }
            if (respose.clubs) {
                if (respose.clubs.length) {
                    this.setState({
		            	sessionId:respose.clubs[0].sessionId,
		            	activity_club:respose.clubs
		            });
                    this.getActivityData();
                }
            }
            //结束了才获取阵容数据
            if(respose.match_status === 3){
                this.getBg(respose.games_id);
                if(respose.apply){
                    this.setState({
		            	lineups:respose.apply
		            });
                }
            }else{
            	this.getApply(id);
                this.getRule(respose.games_id);
            }
        })
	}
	//获取报名用户列表
    getApply(id){
        Common.get({
            url:'/wxapi/activity/applyed',
            data: {
                activityId: id,
                row: 14
            },
        }).then(respose=>{
        	this.setState({applyed:respose})
        })
    }
    getRule(id){
        Common.get({
            url:'/api/games/rule?gameId='+id,
        }).then(respose=>{
            this.setState({rules:respose})
        })
    }
    getBg(id){
        Common.get({
            url:'/api/game/getgameimage?game_id='+id,
        }).then(respose=>{
            this.setState({bg:respose.thumb_minbg})
        })
    }
    tabSwitch(index){
        this.setState({tabIndex:index})
        //查询阵容数据
        if(index === 1){
            this.getLineupUser();
        }
    }
    getLineupUser(){
    	Common.get({
            url:'/api/activity/userlocation',
            data:{
            	applyId: this.state.applyId
            }
        }).then(respose=>{
            if (respose) {
            	this.setState({
            		lineupList:respose.battle
            	});
                var item = this.state.lineupList;
                var len = item.length;
                var allPower = 0;
                for (let i = 0; i < len; i++) {
                    if(!item[i].power){
                        allPower+=0;
                    }else{
                        allPower+=item[i].power;
                    }
                }
                this.setState({
            		allPowerNumber:allPower.toFixed(2)
            	});
                //查询选中用户数据
                this.playerData(item[this.state.userTabIndex].player_id);
            }
        })
    }
    playerData(playerId){
    	Common.get({
            url:'/wxapi/playerinfo',
            data: {
                playerId: playerId,
                battleId: this.state.sessionId
            },
        }).then(respose=>{
        	this.setState({
        		playerDataList:respose
        	});
        })
    }
    userTabSwitch(index,playerId){
    	this.setState({userTabIndex:index});
        this.playerData(playerId);
    }
    getActivityData(){
    	Common.get({
            url:'/api/activity/data',
            data: {
                activityId: this.state.id,
                sessionId: this.state.sessionId
            },
        }).then(respose=>{
        	this.setState({
        		activityData:respose
        	});           
        })
    }
    vsSwitch(sessionId){
        this.setState({sessionId:sessionId});
        this.getActivityData();
    }
    //报名之前检查钱是否足够
    //type: 1 加入 2 追加
    checkMoney(money,type){
        Common.get({
            url:'/api/apply/check',
            data: {
                activityId: this.state.id
            },
        }).then(respose=>{
            if (this.state.match.model === 1) {
                if (respose.money >= respose.apply_apply_limit[0]) {
                	Common.post({
		                url:'/api/apply/activity',
		                data: {
		                    activityId: parseInt(this.state.id,10),
		                    money : parseInt(money,10),  //下注金额
                            type:type
		                }
		            }).then(res=>{
		            	//报名成功之后重新获取货币信息
                        Common.getUserInfo(()=>{
                        	Common.cuccess("成功");
	                        this.getMatchDetail(this.state.id);
	                        this.getApply(this.state.id);
	                        //报名成功并且金额足够时直接跳转到阵容配置页
                            var path={  
                                    pathname:'/lineup',  
                                    query:{
                                        applyId:res.applyId,
                                        activityId:this.state.id
                                    }  
                                }  
	                        this.props.history.push(path);
                        });
		            })
                } else {
                    Common.fail('老板，您的门票不够，需要兑换'+(parseInt(respose.apply_apply_limit[0],10)-respose.money)+'门票,为您打开兑换页面！');
                }
            }
        })
    } 
    renderTableHead(item,index){
    	if(index === 0){
    		return(
    			<div className="head-bar item">
                    <span className="cell">名称</span>
                    <span className="cell">位置</span>
                    <span className="cell">队伍</span>
                    <span className="cell">总分数</span>
                    <span className="cell">场均分数</span>
                    <span className="cell">参赛场次</span>
                    {
                    	item.datainfo.map((info,idx)=>{
	                		return(
	                			<span key={idx} className="cell">{info.title}</span>
	                		)
	                	})
                    }
                </div>
    		)
    	}
    }
    renderLineupPlayer(item){
        if(!item.player_id){
            return(
                <span className="location_name absolute">{item.name}</span> 
            );
        }else{
            return(
                <div>
                    <img className="select-head absolute" src={item.head} alt="head"></img>                                
	                <span className="power absolute intercept center">{item.power}</span>
	                <div  className="location absolute"><span>{item.location_name || ''}:</span><span style={{color:'#c43c43'}}>￥{item.price}万</span></div>
                </div>
            )
        }
    }
    renderResult(data){
    	var tabIndex = this.state.tabIndex;
    	var mySort;
    	if(data.my_sort){
    		let get_gold;
    		if(data.my_sort[0].get_gold){
                get_gold =(
                	<div>
                    	{data.my_sort[0].get_gold || 0}
                        <img src={this.state.currency[data.my_sort[0].get_type-1]} className={data.my_sort[0].get_type !== 4?'image-diamond':'image-ticket'} alt="currency"></img>
                    </div>);
    		}
    		mySort = (
    			<div className="rank-item my">
                    <span className="index">{data.my_sort[0].rank}</span>
                    <img className="avatar" src={data.my_sort[0].head  || Common.IMG_DEFAULT} alt="avator"/>
                    <span className="username">{data.my_sort[0].nickname}</span>
                    <div style={{width:'2.5rem'}}>
                        {get_gold}
                    </div>
                    <span className="score">{data.my_sort[0].integral || 0}分</span>
                </div>
    		)
    	}
    	if(tabIndex === 0){
            return(
            	<div className="rank">
		            <div className="rank-head">
		                <Link  to="'/interaction/vs?uid='+data.activity_sort[1].uid+'&gameid='+id+'&applyId='+data.activity_sort[1].id+'&my='+myApplyId"  className={`item two {'cen':data.activity_sort.length == 2}`} v-if="data.activity_sort && data.activity_sort.length > 1">
		                    <div className="username">{data.activity_sort[1].nickname}</div>
		                    <div className="image">
		                        <img src={data.activity_sort[1].head  || Common.IMG_DEFAULT} alt="avator"/>
		                    </div>
		                    <div className="score">{data.activity_sort[1].integral || 0}分</div>
		                    <div className="number">
		                        {data.activity_sort[1].get_gold || 0}
		                        <img src={this.state.currency[data.activity_sort[1].get_type-1]} className={data.activity_sort[1].get_type !== 4?'image-diamond':'image-ticket'} alt="avator"></img>
		                    </div>
		                </Link>
		                <Link to="'/interaction/vs?uid='+data.activity_sort[0].uid+'&gameid='+id+'&applyId='+data.activity_sort[0].id+'&my='+myApplyId" className="item one" v-if="data.activity_sort && data.activity_sort.length > 0">
		                    <div className="username">{data.activity_sort[0].nickname}</div>
		                    <div className="image">
		                        <img src={data.activity_sort[0].head  || Common.IMG_DEFAULT} alt="avator"/>
		                    </div>alt="avator"
		                    <div className="score">{data.activity_sort[0].integral || 0}分</div>
		                    <div className="number">
		                        {data.activity_sort[0].get_gold || 0}
		                        <img src={this.state.currency[data.activity_sort[0].get_type-1]} className={data.activity_sort[0].get_type !== 4?'image-diamond':'image-ticket'} alt="avator"></img>
		                    </div>
		                </Link>
		                <Link  to="'/interaction/vs?uid='+data.activity_sort[2].uid+'&gameid='+id+'&applyId='+data.activity_sort[2].id+'&my='+myApplyId" className="item three" v-if="data.activity_sort && data.activity_sort.length > 2">
		                    <div className="username">{data.activity_sort[2].nickname}</div>
		                    <div className="image">
		                        <img src={data.activity_sort[2].head  || Common.IMG_DEFAULT} alt="avator"/>
		                    </div>
		                    <div className="score">{data.activity_sort[2].integral || 0}分</div>
		                    <div className="number">
		                        {data.activity_sort[2].get_gold || 0}
		                        <img src={this.state.currency[data.activity_sort[2].get_type-1]} className={data.activity_sort[2].get_type !== 4?'image-diamond':'image-ticket'} alt="avator"></img>
		                    </div>
		                </Link>
		            </div>
		            <div className="list">
		                <div className="pa">
		                    {
		                    	data.activity_sort.map((item,index)=>{
		                    		return(
		                    			<Link key={index} to="/my" className="rank-item" v-if="index > 2">
				                            <span className="index">{index + 1}</span>
				                            <img className="avatar" src={item.head || Common.IMG_DEFAULT} alt="avator"/>
				                            <span className="username">{item.nickname}</span>
				                            <div className="number score">
				                                {item.get_gold || 0}
				                                <img src={this.state.currency[item.get_type-1]} className={item.get_type !== 4?'image-diamond':'image-ticket'} alt="avator"></img>
				                            </div>
				                            <span className="score">{item.integral || 0}分</span>
				                        </Link>
		                    		)
		                    	})
		                    }
		                    {mySort}
		                </div>
		            </div>
		        </div>
            )
    	}else if(tabIndex === 1){
    		let defaultHtml;
    		if(this.state.playerDataList.length === 0){
                defaultHtml = (
                 <div style={{paddingtottom: '.3rem'}}>
		    		<div className="default">
			            <img src="http://oslg9bt6h.bkt.clouddn.com/applet/img/default.png" alt="default"></img>
			        </div>
			        <div className="default-text center">暂无比赛数据</div>
		    	</div>
		    	)
    		}
            return(
                <div className="finish-lineup-bg">
                    <div style={{background:'transparent',height: '600px'}}>	
		                <Carousel autoplay={true} infinite dots={false} style={{background:'transparent',marginBottom:'0'}}>
				          {this.state.lineups.map((lineups,index) => (
				            <div key={index} className="my-match-guess">
					            <div className="my-lineup" style={{backgroundImage:'url('+this.state.bg+')',backgroundSize:'100%'}}>
						            {
						            	lineups.player.map((item,index)=>{
						            		return (
						            			<div key={index} className="item relative">
						            			    <img className="select-tag" src={item.player_id?require('./../images/person-selected.png'):require('./../images/select-normal.png')} alt="select-tag"></img>
					                                {this.renderLineupPlayer(item)}
					                                <span className="userinfo absolute moreDot center">{item.name}</span>
					                            </div>
						            		);
						            	})
						            }
		                        </div>
		                        <div className="capability-bar center">
		                            <img className="image-capability" src={require('./../images/capability.png')} alt="capability"></img>
		                            总战力：{this.state.allPowerNumber}
		                        </div>
		                        <div  className="lineup-tab">
		                            {
		                            	lineups.player.map((item,idx)=>{
		                            		return(
		                            			<div key={idx} className={`lineup-item ${this.state.userTabIndex===idx?'user-selected':''}`} onClick={this.userTabSwitch.bind(this,idx,item.player_id)}>
					                                <span className="label">{item.player_name || item.name}</span>
					                                <div>
					                                    <img className={`image-head ${this.state.userTabIndex===idx?'head-selected':''}`} src={item.head} alt="head"></img>
					                                </div>     
					                            </div>
		                            		)
		                            	})
		                            }
		                        </div>
		                        <div  className="lineup-data-tab">
		                            <div className="data-item">比赛数据</div>
		                            <div className="data-item">系数</div>
		                            <div className="data-item">结果</div>
		                        </div>
		                        {
		                        	this.state.playerDataList.map((item,index)=>{
                                        return(
                                            <div className="lineup-data-list" key={index}>
					                            <div className="list-item">
					                                <span className="player-title text-left">{item.item_name}</span>
					                                <span className="dot text-left">  .....................</span>
					                                <span className="player-value center">{item.item_integral}</span>
					                                <span className="player-value center" style={{marginLeft:'.15rem'}}>{item.extend_value}</span>
					                                <span className="player-value number center" style={{marginLeft:'.15rem'}}>{item.integral}</span>
					                            </div>
					                        </div>
                                        );
		                        	})
		                        }
		                        {defaultHtml}
				            </div>
				          ))}
				        </Carousel>
			        </div>
		        </div>
            )
    	}else if(tabIndex === 2){
            return(
            	<div className="reuslt-data">
		            <div className="vs-tab">
		                {
		                	this.state.activity_club.map((item,index)=>{
		                		return(
		                			<div key={index} className={`item center ${item.sessionId === this.state.sessionId?'act':''}`} onClick={this.vsSwitch.bind(this,item.sessionId)}>
				                        <span>{item.items[0].name}</span>
				                        <span style={{fontSize:'.2rem',margin:'0 5px'}}>vs</span>
				                        <span>{item.items[1].name}</span>
				                    </div>
		                		)
		                	})
		                }
		            </div>
		            <div className="data-list">
		                {
		                	this.state.activityData.map((item,index)=>{
		                		return(
		                			<div key={index}>
					                    {this.renderTableHead(item,index)}
					                    <div className="item">
					                        <div className="cell"><span>{item.name}</span></div>
					                        <span className="cell locations">{item.locations}</span>
					                        <span className="cell">{item.club_name}</span>
					                        <span className="cell">{item.total_pts}</span>
					                        <span className="cell">{item.avg_pts}</span>
					                        <span className="cell">{item.player_count}}</span>
					                        {
					                        	item.datainfo.map((info,idx)=>{
							                		return(
							                			<span key={idx} className="cell">{info.value}</span>
							                		)
							                	})
					                        }
					                    </div>
						            </div>
		                		)
		                	})
		                }
		            </div>
		        </div>
            )
    	}
    }  
    renderMatchStatus(match){
    	var buttonText;
    	if(match.apply_people === match.activity_people){
    		buttonText = (<div className="match-btn center" style={{background:'#ddd',color:'#fff'}}>报名已满</div>);
    	}else if(((!match.apply || match.apply.length === 0) && (match.apply_people !== match.activity_people)) && (match.model === 1)){
    		buttonText = (
    		    <div className="match-btn center" style={{background:'#B3261D',color:'#fff'}} onClick={this.checkMoney.bind(this,match.apply_limit,1)}>
                    {match.apply_limit}
                    <img className={match.apply_type !== 4?'image-diamond':'image-ticket'} src={this.state.currency[match.apply_type-1]} alt="currency" style={{margin:'0 .05rem'}}></img>
                    加入
                </div>
    		);
    	}else if(((!match.apply || match.apply.length === 0) && (match.apply_people !== match.activity_people)) && (match.model === 2)){
    		buttonText = (
    		    <div className="match-btn center" style={{background:'#B3261D',color:'#fff'}}>报名</div>
    		);
    	}
    	if(match.match_status === 0){
            return(
            	<div>	
	                <div className="state">距离报名截止还有</div>
					<div className="time">{match.stateTimeText}</div>
				</div>
            )
    	}else if(match.match_status === 1){
            return (
                <div>
	            	<div className="z-c-gray center">距离报名截止还有</div>
	            	<div className="match-timer center">
	            	    <Countdowm format='false' endTime={match.begin_time} endText="00:00:00"></Countdowm>
	            	</div>
	                {buttonText}
                </div>
            );
    	}else if(match.match_status === 2){
            return(<span className="z-c-gray">比赛中，已截止选择阵容</span>);
    	}else if(match.match_status === 3){
            return(<span className="z-c-gray">比赛结束，已截止选择阵容</span>);
    	}else if(match.match_status === 9){
            return(<span className="z-c-gray">比赛终止</span>);
    	}
    }
    renderLineupStatus(match){
		if((match.match_status === 0 || match.match_status === 1) && match.ceil === 0){
    		return (
    		    <div className="match-btn center" style={{backgroundColor:'#F3C53E',color:'#fff'}}>
		            追加阵容{match.apply_limit}
		            <img className={match.apply_type !== 4?'image-diamond':'image-ticket'} src={this.state.currency[match.apply_type-1]} alt="currency" style={{margin:'0 .05rem'}}></img>
		        </div>
    		)
    	}else if((match.match_status === 0 || match.match_status === 1) && match.ceil === 1){
    		return (<div style={{backgroundColor:'#ddd',color:'#fff'}}>阵容已满</div>)
    	}
    }
    renderApply(match){
    	if(match.apply && match.apply.length > 0 && match.match_status !== 9){
            return(
                <div>
		            {   
		            	match.apply.map((apply,index)=>{
                            return(<div key={index} className="match-btn center" style={{background:'#B3261D',color:'#fff'}}>
		                        <Link to={{pathname:'/lineup',state:{applyId:apply.id,activityId:match.id,status:match.match_status}}} style={{color:'#fff',display:'block'}}>{apply.submit===1?'查看阵容':'布置阵容'}</Link>
		                    </div>)
		            	})
		            } 
		            {this.renderLineupStatus(match)}
	            </div>
            )
    	}
    }
    renderContent(match){
       if(match.match_status === 3){
           //比赛结束部分
			return (
				<div className="game-end">
				    <div className="header">
			            <Carousel autoplay={true} infinite className="vs-list" style={{background:'transparent',marginBottom:'0'}}>
				          {this.state.activity_club.map((item,index) => (
				            <div key={index} className="item" style={{borderTop:'none'}}>
					            <div className="team center">
	                                <div className="team-logo">
	                                    <img src={item.items[0].logo} className="image-team" alt="logo"></img>
	                                </div>
	                                <div className="team-name">{item.items[0].name}</div>
	                            </div>
	                            <div className="info center" style={{marginTop:'.5rem'}}>
	                                <div className="time" style={{color:'#fff'}}>{Common.formatDate(item.begin_time,"MM-dd hh:mm")}</div>
	                                <div className="title">{item.title}</div>
	                            </div>
	                            <div className="team center">
	                                <div className="team-logo">
	                                    <img src={item.items[1].logo} className="image-team" alt="logo"></img>
	                                </div>
	                                <div className="team-name">{item.items[1].name}</div>
	                            </div>
				            </div>
				          ))}
				        </Carousel>
			        </div>
			        <div className="tab">
			            <div className={`item ${this.state.tabIndex===0?'act':''}`} onClick={this.tabSwitch.bind(this,0)}>
			                <span className="label">排名</span>
			            </div>
			            <div className={`item ${this.state.tabIndex===1?'act':''}`} onClick={this.tabSwitch.bind(this,1)}>
			                <span className="label">阵容</span>
			            </div>
			            <div className={`item ${this.state.tabIndex===2?'act':''}`} onClick={this.tabSwitch.bind(this,2)}>
			                <span className="label">战报</span>	
			            </div>
			        </div>
			        {this.renderResult(match)}
				</div>
			)
		}else{
			//比赛未结束部分
			return (
			    <div className="text-left">
			    	<div className="operation">
			            <div className="match-title">{match.title}</div> 
			            {this.renderMatchStatus(match)} 
			            {this.renderApply(match)}
			        </div>
		            <div className="player">
			            <span>与真实比赛同步开始，根据阵容积分击败其他参赛者</span>
			            <div className="heads">
			                <div>
			                    {
			                    	this.state.applyed.map((item,index)=>{
			                    		if(index<15){
			                    			return(<img key={index} src={item.head || Common.IMG_DEFAULT} alt="head"></img>)
			                    		}
			                    	})
			                    }
			                    <span className="center apply_number">{this.state.applyed.length}</span>
			                </div>
	            		    <Link to="/interaction/player" style={match.match_status === 2?{}:{display:'none'}}>
			                    <span className="apply-more">查看更多</span> 
			                </Link> 
			            </div>
			        </div>
			        <div className="bonus">
			            <div className="bonus-head">
			                <span>奖金</span>
			                <span style={{'color':match.owner_type === 1?'#F2C53D':'#29AEF5'}} className="total">{match.totals}</span>
		                    <img className={match.owner_type!==4?'image-diamond':'image-ticket'} alt="currency" src={this.state.currency[match.owner_type-1]} style={{verticalAlign:match.owner_type === 3?'-2px':''}}></img>
			                <span className="text center">奖金分配</span>
			            </div>
			            <div className="bonus-list">
		                    {
		                    	this.state.activity_rule.map((money,index)=>{
	                                return (
	                                    <div key={index} className="item">
					                        <div className="title">{money.name}</div>
					                        <div className="money" style={{color:match.owner_type === 1?'#F2C53D':'#29AEF5'}}>{money.money}</div>
					                    </div>
	                                );
		                    	})
		                    }
			            </div>
			            <div className="tips">
			                <div className="item">比赛结束后，根据比赛结果参赛阵容积分，按照阵容积分排名高低决定名次。阵容积分相同按照提交时间，提交越早名次越靠前；</div>
			                <div className="item">玩家在一场比赛中报名参赛了多少个阵容，每个阵容都单独结算名次和奖励。</div>
			                <div className="item">本软件参与的任何商业活动均与苹果公司（apple Inc.）无关。</div>
			            </div>
			        </div>
			        <div className="vs-list">
			            <div className="vs-head center">本房间使用比赛</div>
		                {
		                	this.state.activity_club.map((club,index)=>{
                                return(
	                                <div key = {index} className="item">
					                    <div className="team center">
					                        <div className="team-logo">  
					                           <img src={club.items[0].logo} className="image-team" alt="logo"></img>
					                        </div>
					                        <div className="team-name">{club.items[0].name}</div>
					                    </div>
					                    <div className="info center" style={{paddingTop:'.5rem'}}>
					                        <div className="time">{Common.formatDate(club.begin_time,'MM/dd hh:mm')}</div>
					                        <div className="title">{club.title}</div>
					                    </div>
					                    <div className="team center">
					                        <div className="team-logo">  
					                           <img src={club.items[1].logo} className="image-team" alt="logo"></img>
					                        </div>
					                        <div className="team-name">{club.items[1].name}</div>
					                    </div>
					                </div>
					            )
		                	})
		                }
			        </div>
			        <div className="rule-list">
			            <div className="rule-head">规则说明</div>
			            {
			            	this.state.rules.map((rule,index)=>{
                                return(<div key = {index} className="item">
					                <span>{rule.item_name}</span>
					                <span className="line"></span>
					                <span className="score">{rule.item_integral}分</span>
					            </div>);
			            	})
			            }
			        </div>
		        </div>
			)
		}
    }
	render(){
		var match = this.state.match;
		return (<div className="interaction">{this.renderContent(match)}</div>)
	}
}

const mapStateToProps = function(store){
    return {
        data:store.data
    };
};

export default connect(mapStateToProps)(Detail);