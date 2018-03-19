import React,{ Component } from 'react'
import { connect } from 'react-redux';
import { PullToRefresh, ListView } from 'antd-mobile';
import store from './../redux/store.js';

//引入定义的action
import {loading } from '../actions/plan.js'

import './home.css';

import Common from './../common.js'
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom'

import  './interaction.css'

const NUM_ROWS = 5;
let pageIndex = 1;

class Interaction extends Component {
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
            isAll:false
		}
    }
    //组件加载完成
	componentDidMount() {
		this.getTags();
        this.getMatchList('fresh');
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
            url:'/apivtwo/activity/tags?type_id='+this.state.classifyId
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
    getMatchList(type){
        Common.get({
            url:'/apivtwo/activity/lists',
            data: {
                page: pageIndex,
                row: NUM_ROWS,
                tag_id: this.state.tagId,
                type_id:Number(this.state.classifyId)
            },
        }).then(respose=>{
            var list = this.state.matchList;
            if(pageIndex == 1){
                list = respose;
                this.setState({
                    matchList:list
                })
                //下拉加载
                if(type == 'fresh'){
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
                list = list.concat(respose);
                this.setState({
                    matchList:list
                })
                //上滑加载
                if(type == 'end'){
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
                        <div key={index} className={state.currentTagIndex == index?'act':''} onClick={this.serchByTag.bind(this,index,tag.id)}>
					    	<span className="nav-title">{tag.title}</span>
					    	<div className={`absolute ${state.currentTagIndex == index ? 'border' : ''}`}></div>
					    </div>
                    )
                })
		    }
		    </div>
		)
	}
    renderBottomBar(){
        if(this.state.isLoading && !this.state.isAll && pageIndex != 1){
            return (<img className="loading-gif" src={require('./../images/loading.gif')}/>)
        }else if(!this.state.isLoading && this.state.isAll){
            return (<span style={{fontSize: '0.22rem', color: 'rgb(142, 148, 183)'}}>没有更多数据了</span>)
        }
    }
    renderContainer(row){
        if(this.state.matchList.length == 0){
            return(
                <div>
                <div className="default">
                    <img src="http://oslg9bt6h.bkt.clouddn.com/applet/img/default.png"></img>
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
    componentWillReceiveProps(nextProps){
        console.log(nextProps.matchList.length);
        console.log(this.state.matchList.length);
        if(nextProps.matchList.length !== this.state.matchList.length){
            //console.log('componentWillReceiveProps === '+nextProps);
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

            let circular,state;
            if (obj.match_status == 2) {
                circular = (<span className="circular absolute" style={{backgroundColor:'#B52E25'}}></span>);
            } else {
                circular = (<span className="circular absolute" ></span>);
            }

            if (obj.match_status == 0) {
                state = (<span className="state absolute">未开始</span>);
            } else if(obj.match_status == 1) {
                state = (<span className="state absolute">报名中</span>);
            } else if(obj.match_status == 2) {
                state = (<span className="state absolute" style={{color:'#B52E25'}}>比赛中</span>);
            } else if(obj.match_status == 3) {
                state = (<span className="state absolute">已结束</span>);
            } else if(obj.match_status == -1) {
                state = (<span className="state absolute">终止比赛</span>);
            }

            return (
                <Link key={rowID} className="item" to={{pathname: `interaction/${obj.id}`}}>
                    <div className="title_bar">
                        <img src={obj.small_program_cover?obj.small_program_cover:require('./../images/item-bg.png')} className="image_title_bg"></img>
                        <div className="title_bar_content">
                            <div className="title">
                                <div className="relative" v-if="item.tag_title">
                                    <img style={{marginTop:'.12rem'}} src={require('./../images/tag_normal.png')} className="img_tag"></img>
                                    <span className="tag">{obj.tag_title}</span>
                                </div>
                                <div className="moreDot" style={{'width':obj.tag_title?'4rem':'5.35rem','display':'inline-block','color':'#fff'}}>{obj.title}</div>
                            </div>
                            <div className="relative">
                                {circular}  
                                {state}
                            </div>
                        </div>
                    </div>
                    <div className="info">
                        <div style={{display:'flex',width:'5.8rem'}}> 
                            <div className="info-item">
                                <div className="value">{obj.apply_people} / {obj.activity_people}</div>
                                <div>参与人数</div>
                            </div>
                            <div className="info-item" >
                                <div>
                                   <img src={this.state.currency[obj.owner_type-1]} 
                                   className={`${obj.owner_type == 1 || obj.owner_type == 2 ? 'image-diamond' : ''} ${obj.owner_type == 3 ? 'image-crystal' : ''} ${obj.owner_type == 4 ? 'image-ticket' : ''}`} 
                                   style={{marginLeft:'2px'}}></img>
                                    <span className="value">{obj.totals}</span>
                                </div>
                                <div>奖金总额</div>
                            </div>
                            <div className="info-item" style={{borderRight:'none'}}>
                                <div className="value">
                                    <img src={this.state.currency[obj.apply_type-1]}
                                    className={`${obj.apply_type == 1 || obj.apply_type == 2 ? 'image-diamond' : ''} ${obj.apply_type == 3 ? 'image-crystal' : ''} ${obj.apply_type == 4 ? 'image-ticket' : ''}`} ></img>
                                    {obj.apply_limit}
                                </div>
                                <div>报名费</div>
                            </div>
                        </div>
                        <div className="center" style={{marginRight:'.36rem',color:'rgb(43,32,49)'}}>
                            <div>中奖范围</div>
                            <div style={{fontSize:'.28rem'}}>前{obj.second_range}名</div>
                        </div>
                    </div>
                    <div className="bottom">
                        <div className="time">
                            <img src={require('./../images/time.jpg')} className="image-time"></img>
                            开赛 {Common.formatDate(obj.begin_time,'MM/dd hh:mm')}
                        </div>
                        <div className="people">{ obj.begin_condition>0 ? `(满${obj.begin_condition}人开)` : '(必开)' }</div>
                    </div>
                </Link>
            )
        } 
	    // renderHeader={() => <span>Pull to refresh</span>}
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

export default connect(mapStateToProps)(Interaction);