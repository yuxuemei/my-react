import React,{ Component } from 'react'
import { connect } from 'react-redux';
import { PullToRefresh, ListView } from 'antd-mobile';

import Common from './../common.js'
import ReactDOM from 'react-dom';

import  './record.css'

const NUM_ROWS = 10;
let pageIndex = 1;

class Record extends Component {
    constructor(props){
        super(props);
        const dataSource = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
        });
        this.state = {
            currency:Common.CURRECY, //货币图标
            type:this.props.location.state.type,
            dataSource,
            refreshing: true,
            isLoading: true,
            height: document.documentElement.clientHeight,
            recordList:[],
            isAll:false
        }
    }
    //组件加载完成
    componentDidMount() {
        this.getRecordList('fresh');
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
        this.getRecordList('fresh');
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
            this.getRecordList('end')
        }
    };
    getRecordList(type){
        Common.get({
            url:'/api/user/goldhistory',
            data: {
                page: pageIndex,
                row: NUM_ROWS,
                type:Number(this.state.type)
            },
        }).then(respose=>{
            var list = this.state.recordList;
            this.setState({
                recordList:[...list,...respose]
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
    }
    genData(item = NUM_ROWS) {
        const dataArr = [];
        for (let i = 0; i < item; i++) {
            dataArr.push(`row - ${((pageIndex-1) * item) + i}`);
        }
        return dataArr;
    }
    renderBottomBar(){
        if(this.state.isLoading && !this.state.isAll && pageIndex !== 1){
            return (<img className="loading-gif" src={require('./../images/loading.gif')} alt="loading-gif"/>)
        }else if(!this.state.isLoading && this.state.isAll){
            return (<span style={{fontSize: '0.22rem', color: 'rgb(142, 148, 183)'}}>没有更多数据了</span>)
        }
    }
    renderContainer(row){
        if(this.state.recordList.length === 0){
            return(
                <div>
                <div className="default">
                    <img src="http://oslg9bt6h.bkt.clouddn.com/applet/img/default.png" alt="default"></img>
                </div>
                <div className="default-text center">您还没有流水记录</div>
            </div>
            )
        }else{
            return(
                <ListView  key="1" ref={el => this.lv = el} dataSource={this.state.dataSource} 
                    renderFooter={() => (<span> {this.renderBottomBar()} </span>)}
                    renderRow={row} style={{height: this.state.height}}
                    pullToRefresh={<PullToRefresh refreshing={this.state.refreshing} onRefresh={this.onRefresh} />} onEndReached={this.onEndReached}  pageSize={5}  />
            )
        }
    }
    render() {
        var record = this.state.recordList;
        let index = record.length - 1;
        const row = (rowData, sectionID, rowID) => {
            if (index < 0) {
                index = record.length - 1;
            }
            const obj = record[index--];
            var type = this.state.type;
            return (
                <div key={rowID} className="item">
                    <div className="row text-left">
                        <div className="title">流水号:{obj.order_no}</div>
                        <div className="type">{obj.type}</div>
                    </div>
                    <div className="row text-left">
                        <div className="text">{obj.add_time}</div>
                        <div className="currency-num"><span style={{marginRight:'.1rem',verticalAlign:'.04rem'}}>{obj.gold}</span><img src={this.state.currency[type-1]} alt="currency" className={type !== 4?'image-diamond':'image-ticket'}></img>
                        </div>
                    </div>
                </div>
            )
        } 
        return (
            <div  className="record-list">
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

export default connect(mapStateToProps)(Record);