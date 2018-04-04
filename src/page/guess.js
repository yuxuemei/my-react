import React,{ Component } from 'react'
import { connect } from 'react-redux';
import { PullToRefresh, ListView } from 'antd-mobile';

import Common from './../common.js'
import Countdowm from './../components/countdown.js'
import Bet from './../components/bet.js'
import Footer from './../components/footer.js';
import store from '../redux/store.js'
import { bet } from '../actions/plan.js'
import ReactDOM from 'react-dom';

import  './guess.css'

const NUM_ROWS = 10;
let pageIndex = 1;

class Guess extends Component {
	constructor(props){
        super(props);
        const dataSource = new ListView.DataSource({
	        rowHasChanged: (row1, row2) => row1 !== row2,
	    });
        this.state = {
            currency:Common.CURRECY, //货币图标
        	classifyId:this.props.match.params.id,
            tags:[],
        	currentTagIndex:0,
            tagId:'',
        	dataSource,
		    refreshing: true,
		    isLoading: true,
		    height: document.documentElement.clientHeight,
            matchList:[],
            isAll:false,
            isShow:false,
            showGuessId:'', //当前打开的赛事id
            gameId:'',
            guessChildId:'',
            betteam:'',//之前下注项的名字
		}
    }
    //组件加载完成
	componentDidMount() {
		this.getTags();
        this.getGuessList('fresh');
        var lv =  ReactDOM.findDOMNode(this.lv);
        var offsetTopHeight = 0;
        if(lv){
            offsetTopHeight = lv.offsetTop;
        }
	    const hei = this.state.height - offsetTopHeight;
	    this.setState({
	        height: hei,
	    });
	}
    //下拉刷新
	onRefresh = () => {
        pageIndex = 1;
        this.getGuessList('fresh');
	    
	};
    //滑动到底部
	onEndReached = (event) => {
	    // load new data
	    // hasMore: from backend data, indicates whether it is the last page, here is false
	    if (this.state.isLoading && !this.state.hasMore) {
	      return;
	    }
	    console.log('reach end', event);
        pageIndex++;
        if(!this.state.isAll){
            this.getGuessList('end')
        }
	};
	getTags(){
        Common.get({
            url:'/api/games/sort'
        }).then(respose=>{
            respose.unshift({
				id: "",
              title: "全部"
            })
            this.setState({
            	tags:respose
            })
        })
	}
    toggleChild(id){
        console.log('showGuessId==',this.state.showGuessId,'当前id==',id,'是否显示==',this.state.isShow)
        if(this.state.showGuessId === id){
            console.log('切换');
            this.setState({
                isShow:!this.state.isShow,
                showGuessId:id
            })
        }else{
            console.log('xianshi');
            this.setState({
                isShow:true,
                showGuessId:id
            })
        }
        console.log('showGuessId==',this.state.showGuessId,'当前id==',id,'是否显示==',this.state.isShow)
    }
    getGuessList(type){
        Common.get({
            url:'/api/guessinfo/index',
            data: {
                page: pageIndex,
                row: NUM_ROWS
            },
        }).then(respose=>{
            var guessData = [];
            for(var key in respose){  
                /*let obj ={};
                obj.name = key;
                obj.data = respose[key];*/
                guessData = guessData.concat(respose[key]);
            }  
            var list = this.state.matchList;
            this.setState({
                matchList:[...list,...guessData]
            })
            if(pageIndex === 1){
                //下拉加载
                if(type === 'fresh'){
                    if(guessData.length>=NUM_ROWS){ 
                        this.setState({ refreshing: true, isLoading: true ,isAll:false});
                        // simulate initial Ajax
                        setTimeout(() => {
                            this.rData = this.genData(guessData.length);
                            this.setState({
                                dataSource: this.state.dataSource.cloneWithRows(this.rData),
                                refreshing: false,
                                isLoading: false,
                            });
                        }, 1000);
                    }else{
                        this.setState({
                            isAll:true
                        })
                    }
                }
            }else{
                //上滑加载
                if(type === 'end'){
                    this.setState({ isLoading: true,isAll:false});
                    setTimeout(() => {
                        this.rData = [...this.rData, ...this.genData(guessData.length)];
                        this.setState({
                            dataSource: this.state.dataSource.cloneWithRows(this.rData),
                            isLoading: false,
                        });
                        //查出来的条数小于row则数据加载完了
                        if(guessData.length<NUM_ROWS){
                            this.setState({isAll:true})
                        }else{
                            this.setState({isAll:false})
                        }
                    }, 1000);
                }
            }
        })
    }
    genData(item = NUM_ROWS) {
        const dataArr = [];
		for (let i = 0; i < item; i++) {
		    dataArr.push(`row - ${((pageIndex-1) * item) + i}`);
		}
	    return dataArr;
	}
	serchByTag(index,id){
		this.setState({
			currentTagIndex:index,
			tagId:id
		},()=>{
            pageIndex = 1;
            this.getGuessList('fresh');
        })
    }
    //下注，追加
    openBetBox(guessChildId,betteam,isBet){
        if(isBet){
            this.setState({
                guessChildId:guessChildId,
                betteam:betteam
            },()=>{
                var b = this.props.data.bet;
                store.dispatch(bet(!b))
            })
        }
    }
    renderNav(){
		var state = this.state;
		return (
		    <div className="nav fixed text-left">
		    {
		    	state.tags.map((tag,index)=>{
                    return (
                        <div key={index} className={state.currentTagIndex === index?'act':''} onClick={this.serchByTag.bind(this,index,tag.id)}>
					    	<span className="nav-title">{tag.title}</span>
					    	<div className={`absolute ${state.currentTagIndex === index ? 'border' : ''}`}></div>
					    </div>
                    )
                })
		    }
		    </div>
		)
	}
    renderBottomBar(){
        if(this.state.isLoading && !this.state.isAll && pageIndex !== 1){
            return (<img className="loading-gif" src={require('./../images/loading.gif')} alt="loading-gif"/>)
        }else if(!this.state.isLoading && this.state.isAll){
            return (<span style={{fontSize: '0.22rem', color: 'rgb(142, 148, 183)'}}>没有更多数据了</span>)
        }
    }
    renderContainer(row){
        if(this.state.matchList.length === 0){
            return(
                <div>
                <div className="default">
                    <img src="http://oslg9bt6h.bkt.clouddn.com/applet/img/default.png" alt="default"></img>
                </div>
                <div className="default-text center">这里暂时还没有比赛</div>
            </div>
            )
        }else{
            return(
                <ListView className="guess-list" key="1" ref={el => this.lv = el} dataSource={this.state.dataSource} 
                    renderFooter={() => (<span> {this.renderBottomBar()} </span>)}
                    renderRow={row} style={{height: this.state.height}}
                    pullToRefresh={<PullToRefresh refreshing={this.state.refreshing} onRefresh={this.onRefresh} />} onEndReached={this.onEndReached}  pageSize={5}  />
            )
        }
    }
    renderStatus(status){
        if(status === 0){
            return(<span className="status status-highlight">未开始</span>);
        }else if(status === 1){
            return(<span className="status status-highlight">可预测</span>);
        }else if(status === 2){
            return(<span className="status status-grey">已封盘</span>);
        }else if(status === 3){
            return(<span className="status status-grey">已结算</span>);
        }
    }
    renderChildStatus(itemName){
        if(itemName.status === 0){
            return(<span className="status">未开始</span>);
        }else if(itemName.status === 1 && itemName.is_item_join === 1){
            return(<span className="statust">(可追加)</span>);
        }else if(itemName.status === 1 && itemName.is_item_join === 0){
            return(<span className="status">(可预测)</span>);
        }else if(itemName.status === 2){
            return(<span className="status1">(已封盘)</span>);
        }else if(itemName.status === 4){
            return(<span className="status1">(已结算)</span>);
        }
    }
    renderChildSamll(itemName){
        if(itemName.status === 1 && itemName.is_item_join === 1){
            //可追加
            return (
                <div className="guess-item">
                    {
                        itemName.team.map((child,betIndex)=>{
                            return(
                                <div className={child.status !== '-1'?'guess-item-detail':'guess-item-detail-grey'} key={betIndex} onClick={this.openBetBox.bind(this,itemName.id,child.title,child.status !== '-1'?true:false)}> 
                                   <span className="team-name">{child.title}</span>
                                   <span className="team-line"></span>
                                   <span style={{fontSize:'.22rem',color:'#fff'}}>赔率：</span><span className="odds" style={{color:'#fff'}}>{child.odds}</span>
                               </div>
                            )
                        })
                    }
                </div>
            )
        }else if(itemName.status === 1 && itemName.is_item_join === 0){
            //可预测
            return(
                <div className="guess-item">
                   {
                        itemName.team.map((child,betIndex)=>{
                            return(
                                <div className="guess-item-detail" key={betIndex} onClick={this.openBetBox.bind(this,itemName.id,child.title,true)}> 
                                   <span className="team-name">{child.title}</span>
                                   <span className="team-line"></span>
                                   <span style={{fontSize:'.22rem',color:'#fff'}}>赔率：</span><span className="odds" style={{color:'#fff'}}>{child.odds}</span>
                               </div>
                            )
                        })
                    }
                </div>
            )
        }else if(itemName.status === 4 || itemName.status === 2){
            //已结算 已封盘
            return(
                <div className="guess-item">
                    {
                        itemName.team.map((child,betIndex)=>{
                            return(
                                <div className="guess-item-detail-grey" key={betIndex}> 
                                   <span className="team-name">{child.title}</span>
                                   <span className="team-line"></span>
                                   <span style={{fontSize:'.22rem',color:'#fff'}}>赔率：</span><span className="odds" style={{color:'#fff'}}>{child.odds}</span>
                               </div>
                            )
                        })
                    }
                </div>
            )
        }
    }
    renderChildGuess(guess){
        if(this.state.isShow && this.state.showGuessId === guess.id){
            return(
                <div className="item-small">
                {
                    guess.gItem.map((itemName,childIndex)=>{
                        return(
                            <div key={childIndex}>
                                <div className="big-title">
                                   <div>
                                        <span className="title-bar"></span>
                                        <span className="title">{itemName.title}</span>
                                   </div>
                                   <div style={itemName.status !== 1?{}:{display:'none'}}>
                                        {this.renderChildStatus(itemName)}
                                   </div>
                                   <div style={itemName.status === 1?{display:'flex'}:{display:'none'}} className="guess-timer">
                                        <img src={require('./../images/time.jpg')} className="icon-time-countdown" style={{marginTop:'.1rem'}} alt="time"></img>
                                        <Countdowm className="right" format='false' endTime={itemName.bet_end_time} endText="00:00:00"></Countdowm>
                                   </div>
                                </div>
                                {this.renderChildSamll(itemName)}
                            </div>
                        )
                    })
                }  
                </div>
            )
        }
    }
    render() {
        var match = this.state.matchList;
	    let index = match.length - 1;
	    const row = (rowData, sectionID, rowID) => {
		    if (index < 0) {
		        index = match.length - 1;
		    }
	        const obj = match[index--];
            return (
                <div key={rowID}>
                    <div className="apply" style={obj.is_join===1?{}:{display:'none'}}>已参加</div>
                    <div className="big-item" onClick={this.toggleChild.bind(this,obj.id)}>
                        <div className="center" style={{flex:'1',fontSize:'.22rem'}}>
                            <img className="player_logo" alt="player_logo" src={obj.player[0].logo || Common.IMG_DEFAULT}/>
                            <div className="player_name">{obj.player[0].player_name}</div>
                        </div>
                        <div className="info center">
                            <div className="title"><span>{obj.title}</span></div>
                            <div className="result-info">
                                <span className="result" style={obj.guessing_status === 3?{}:{display:'none'}}>{obj.player[0].score}</span>
                                {this.renderStatus(obj.guessing_status)}
                                <span className="result" style={obj.guessing_status === 3?{}:{display:'none'}}>{obj.player[1].score}</span>
                            </div>
                            <div className="time-text"><img src={require('./../images/time.jpg')} className="icon-time" alt="time" />{Common.formatDate(obj.end_time,"MM-dd hh:mm")}</div>
                        </div>
                        <div className="center" style={{flex:'1',fontSize:'.22rem'}}>
                            <img className="player_logo" src={obj.player[1].logo || Common.IMG_DEFAULT} alt="logo"/>
                            <div className="player_name" >{obj.player[1].player_name}</div>
                        </div>
                    </div>
                    {this.renderChildGuess(obj)}
                </div>
            )
        } 
	    return (
	    	<div  className="guess">
	    	    {this.renderNav()}
                {this.renderContainer(row)}
                <Bet guessId={this.state.guessChildId} guessChildId={this.state.guessChildId} betteam = {this.state.betteam}/>
                <Footer/>
		    </div>
	    );
	}
}

const mapStateToProps = function(store){
    return {
        data:store.data
    };
};

export default connect(mapStateToProps)(Guess);