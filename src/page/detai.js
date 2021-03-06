import React,{ Component } from 'react'
import { connect } from 'react-redux';

class Detai extends Component {
	constructor(props){
        super(props);
        // 根据路由 id 跟 store 做过滤
        var arr1= this.props.data.planlist.filter((ele)=>{  
            return ele.id === parseInt(this.props.match.params.id,10);  
        })  
        this.state = {
            plan:arr1[0]
        }
	}
    //组件加载完成
    componentDidMount(){ 
    }
	render(){
		return (
			<div style={{padding: '20px'}}>
                <h3>计划详情</h3>
                <p>id： {this.state.plan.id}</p>
                <p>标题： {this.state.plan.title}</p>
                <p>内容： {this.state.plan.content}</p>
            </div>
		)
	}
}

const mapStateToProps = function (store){
    return {
	    data: store.data
	};
};
export default connect(mapStateToProps)(Detai);