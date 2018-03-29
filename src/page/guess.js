import React,{ Component } from 'react'
import { connect } from 'react-redux';
import { PullToRefresh, ListView } from 'antd-mobile';

import Common from './../common.js'
import ReactDOM from 'react-dom';

import  './guess.css'

const NUM_ROWS = 5;
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
            isBet:false,
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
        this.getMatchList('fresh');
	    
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
            this.getMatchList('end')
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
    /*getMatchList(type){
        Common.get({
            url:'/apivtwo/activity/lists',
            data: {
                page: pageIndex,
                row: NUM_ROWS,
                tag_id: this.state.tagId,
                type_id:38
            },
        }).then(respose=>{
            var list = this.state.matchList;
            this.setState({
                matchList:[...list,...respose]
            })
            if(pageIndex === 1){
                //下拉加载
                if(type === 'fresh'){
                    if(respose.length>=NUM_ROWS){
                        this.setState({ refreshing: true, isLoading: true ,isAll:false});
                        // simulate initial Ajax
                        setTimeout(() => {
                          this.rData = this.genData();
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
                        this.rData = [...this.rData, ...this.genData(respose.length)];
                        this.setState({
                            dataSource: this.state.dataSource.cloneWithRows(this.rData),
                            isLoading: false,
                        });
                        //查出来的条数小于row则数据加载完了
                        if(respose.length<NUM_ROWS){
                            this.setState({isAll:true})
                        }else{
                            this.setState({isAll:false})
                        }
                    }, 1000);
                }
            }
        })
    }*/
    toggleChild(id){
        if(this.state.showGuessId == id){
            this.setState({
                isShow:!this.isShow
            })
        }else{
            this.setState({
                isShow:true
            })
        }
        this.setState({
            showGuessId:id
        })
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
                guessData = respose[key];
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
                            console.log(this.rData);
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

            console.log(`row - ${((pageIndex-1) * item) + i}`);
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
            this.getMatchList('fresh');
        })
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
                <ListView className="list" key="1" ref={el => this.lv = el} dataSource={this.state.dataSource} 
                    renderFooter={() => (<span> {this.renderBottomBar()} </span>)}
                    renderRow={row} style={{height: this.state.height}}
                    pullToRefresh={<PullToRefresh refreshing={this.state.refreshing} onRefresh={this.onRefresh} />} onEndReached={this.onEndReached}  pageSize={5}  />
            )
        }
    }
    renderStatus(status){
        if(status == 0){
            return(<span className="status status-highlight">未开始</span>);
        }else if(status == 1){
            return(<span className="status status-highlight">可预测</span>);
        }else if(status == 2){
            return(<span className="status status-grey">已封盘</span>);
        }else if(status == 3){
            return(<span className="status status-grey">已结算</span>);
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
                    <div className="apply" style={obj.is_join==1?{}:{display:'none'}}>已参加</div>
                    <div className="big-item" onClick={this.toggleChild.bind(this,obj.id)}>
                        <div className="center" style={{flex:'1',fontSize:'.22rem'}}>
                            <img className="player_logo" alt="player_logo" src={obj.player[0].logo || Common.IMG_DEFAULT} />
                            <div className="player_name">{obj.player[0].player_name}</div>
                        </div>
                        <div className="info center">
                            <div className="title"><span>{obj.title}</span></div>
                            <div className="result-info">
                                <span className="result" style={obj.objing_status == 3?{}:{display:'none'}}>{obj.player[0].score}</span>
                                {this.renderStatus(obj.objing_status)}
                                <span className="result" style={obj.objing_status == 3?{}:{display:'none'}}>{obj.player[1].score}</span>
                            </div>
                            <div className="time-text"><img src={require('./../images/time.jpg')} className="icon-time" />{Common.formatDate(obj.end_time,"MM-dd hh:mm")}</div>
                        </div>
                        <div className="center" style={{flex:'1',fontSize:'.22rem'}}>
                            <img className="player_logo" src={obj.player[1].logo || Common.IMG_DEFAULT} />
                            <div className="player_name" >{obj.player[1].player_name}</div>
                        </div>
                    </div>
                </div>
            )
        } 
	    return (
	    	<div  className="match">
	    	    {this.renderNav()}
                {this.renderContainer(row)}
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